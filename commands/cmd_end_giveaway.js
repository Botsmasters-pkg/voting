/*CMD
  command: cmd_end_giveaway
  help: End giveaway flow exactly matching Python bot
  need_reply: false
CMD*/

var OWNER_ID = 8710308658;

function getPropJson(name, default_val) {
  var val = Bot.getProperty(name);
  if (!val) return default_val;
  if (typeof val === "object") return val;
  if (typeof val === "string") {
    try { return JSON.parse(val) || default_val; } catch (e) { return default_val; }
  }
  return default_val;
}

var raw = (options && options.giveaway_id) ? options.giveaway_id : (params || "").trim();
var is_confirm = (options && options.action === "confirm");

if (raw.indexOf("confirm_end_") === 0) {
  is_confirm = true;
  raw = raw.replace("confirm_end_", "");
} else if (raw.indexOf("endgiveaway_") === 0) {
  raw = raw.replace("endgiveaway_", "");
}

var parts = raw.split(" ");
if (parts[0] === "confirm") {
  is_confirm = true;
  raw = parts[1] || "";
}

var gid = raw.trim();
if (!gid) {
  Bot.runCommand("my_giveaways");
  return;
}

var all_giveaways = getPropJson("all_giveaways", {});
var giveaway = all_giveaways[gid];

if (!giveaway) {
  Bot.sendMessage("❌ Contest not found!");
  Bot.runCommand("my_giveaways");
  return;
}

var uid = user.telegramid;
if (uid != OWNER_ID && giveaway.creator != uid && giveaway.creator_id != uid) {
  Bot.sendMessage("🚫 Access Denied.");
  return;
}

var target_chat = (chat && chat.chatid) ? chat.chatid : user.telegramid;

// Step 1: Confirmation Screen
if (!is_confirm) {
  var confirm_text = "<b>⚠️ End this giveaway?</b>";
  var confirm_buttons = [
    [
      { text: "CONFIRM", callback_data: "confirm_end_" + gid, style: "danger" },
      { text: "CANCEL", callback_data: "manage_" + gid, style: "primary" }
    ]
  ];

  if (request && request.callback_query && request.callback_query.message) {
    Api.editMessageText({
      chat_id: request.callback_query.message.chat.id,
      message_id: request.callback_query.message.message_id,
      text: confirm_text,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: confirm_buttons }
    });
  } else {
    Api.sendMessage({
      chat_id: target_chat,
      text: confirm_text,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: confirm_buttons }
    });
  }
  return;
}

// Step 2: Confirmed - End Giveaway
giveaway.ended = true;
giveaway.status = "ended";
giveaway.ended_at = new Date().toISOString();

var users = giveaway.users || {};
var vote_counts = giveaway.vote_counts || {};

if (Object.keys(users).length === 0 && giveaway.participants) {
  for (var i = 0; i < giveaway.participants.length; i++) {
    var p = giveaway.participants[i];
    users[p.id] = p.name || ("User " + p.id);
  }
}

var items = [];
for (var target_id in vote_counts) {
  items.push({
    uid: target_id,
    name: users[target_id] || ("User " + target_id),
    votes: vote_counts[target_id] || 0
  });
}

items.sort(function(a, b) {
  return b.votes - a.votes;
});

var winner_text = "No participants.";
if (items.length > 0) {
  winner_text = "🏆 <b>WINNER:</b> " + items[0].name + " with " + items[0].votes + " votes!";
}

all_giveaways[gid] = giveaway;
Bot.setProperty("all_giveaways", all_giveaways, "json");

// Send announcement to channel
if (giveaway.channel) {
  var channel_msg = "<b>💰 GIVEAWAY ENDED!</b>\n\n" + winner_text;
  Api.sendMessage({
    chat_id: giveaway.channel,
    text: channel_msg,
    parse_mode: "HTML"
  });
}

// Edit private chat message
var end_text = "✅ <b>Ended!</b>\n\n" + winner_text;
var end_buttons = [
  [{ text: "BACK", callback_data: "my_giveaways", style: "primary" }]
];

if (request && request.callback_query && request.callback_query.message) {
  Api.editMessageText({
    chat_id: request.callback_query.message.chat.id,
    message_id: request.callback_query.message.message_id,
    text: end_text,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: end_buttons }
  });
} else {
  Api.sendMessage({
    chat_id: target_chat,
    text: end_text,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: end_buttons }
  });
}
