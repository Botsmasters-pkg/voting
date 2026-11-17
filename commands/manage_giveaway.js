/*CMD
  command: manage_giveaway
  help: Contest Management Panel exactly matching Python bot
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

var gid = (options && options.giveaway_id) ? options.giveaway_id : (params || "").trim();
if (gid.indexOf("manage_") === 0) {
  gid = gid.replace("manage_", "");
}

if (!gid) {
  Bot.runCommand("my_giveaways");
  return;
}

var all_giveaways = getPropJson("all_giveaways", {});
var giveaway = all_giveaways[gid];

var target_chat = (chat && chat.chatid) ? chat.chatid : user.telegramid;

if (!giveaway) {
  var not_found_text = "<b>❌ Not found!</b>";
  var not_found_btn = [[{ text: "BACK", callback_data: "my_giveaways", style: "primary" }]];
  if (request && request.callback_query && request.callback_query.message) {
    Api.editMessageText({
      chat_id: request.callback_query.message.chat.id,
      message_id: request.callback_query.message.message_id,
      text: not_found_text,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: not_found_btn }
    });
  } else {
    Api.sendMessage({
      chat_id: target_chat,
      text: not_found_text,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: not_found_btn }
    });
  }
  return;
}

var uid = user.telegramid;
if (uid != OWNER_ID && giveaway.creator != uid && giveaway.creator_id != uid) {
  Bot.sendMessage("🚫 Access Denied: Aap is giveaway ke creator nahi hain.");
  return;
}

var is_ended = giveaway.ended || giveaway.status === "ended";
var status = is_ended ? "🔴 ENDED" : "🟢 ACTIVE";
var ch_display = giveaway.channel_display || giveaway.channel || "Channel";

var joined_count = 0;
if (giveaway.users && typeof giveaway.users === "object") {
  joined_count = Object.keys(giveaway.users).length;
} else if (giveaway.participants && Array.isArray(giveaway.participants)) {
  joined_count = giveaway.participants.length;
}

var text = 
  "<b>➡️ MANAGEMENT PANEL</b>\n\n" +
  "<b>Status:</b> " + status + "\n" +
  "<b>Channel:</b> " + ch_display + "\n" +
  "<b>Joined:</b> " + joined_count;

var buttons = [
  [
    { text: "ADD VOTES", callback_data: "addvotes_" + gid, style: "primary" },
    { text: "REMOVE VOTES", callback_data: "removevotes_" + gid, style: "danger" }
  ],
  [
    { text: "LEADERBOARD", callback_data: "leaderboard_" + gid, style: "primary" }
  ],
  [
    { text: "END GIVEAWAY", callback_data: "endgiveaway_" + gid, style: "danger" }
  ],
  [
    { text: "BACK", callback_data: "my_giveaways", style: "primary" }
  ]
];

if (request && request.callback_query && request.callback_query.message) {
  Api.editMessageText({
    chat_id: request.callback_query.message.chat.id,
    message_id: request.callback_query.message.message_id,
    text: text,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: buttons }
  });
} else {
  Api.sendMessage({
    chat_id: target_chat,
    text: text,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: buttons }
  });
}
