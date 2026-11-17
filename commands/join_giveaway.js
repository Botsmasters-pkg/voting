/*CMD
  command: join_giveaway
  help: Handle giveaway link and participant entry exactly matching Python bot with safe space routing
  need_reply: false
CMD*/

if (request && request.callback_query) {
  Api.answerCallbackQuery({
    callback_query_id: request.callback_query.id
  });
}

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
var action = (options && options.action) ? options.action : "view";

raw = String(raw).replace(/^join_giveaway\s*/i, "").trim();

var parts = raw.split(/\s+/);
if (parts.length > 1) {
  action = parts[0];
  raw = parts.slice(1).join(" ");
}

if (raw.indexOf("retry_join_") === 0) {
  action = "retry";
  raw = raw.replace("retry_join_", "");
} else if (raw.indexOf("join_") === 0) {
  action = "join";
  raw = raw.replace("join_", "");
}

var gid = raw.trim();
var all_giveaways = getPropJson("all_giveaways", {});
var giveaway = all_giveaways[gid];
var target_chat = (chat && chat.chatid) ? chat.chatid : user.telegramid;
var uid = user.telegramid;

// Dynamic Bot Username detected from token
var BOT_USERNAME = Bot.getProperty("bot_username");
if (!BOT_USERNAME) {
  var bInfo = getPropJson("bot_info", null);
  if (bInfo) {
    if (bInfo.result && bInfo.result.username) BOT_USERNAME = bInfo.result.username.replace("@", "");
    else if (bInfo.username) BOT_USERNAME = bInfo.username.replace("@", "");
  }
}
if (!BOT_USERNAME) {
  BOT_USERNAME = "bot";
}

if (!giveaway) {
  Api.sendMessage({ chat_id: target_chat, text: "<b>❌ INVALID LINK</b>", parse_mode: "HTML" });
  return;
}

if (giveaway.ended || giveaway.status === "ended") {
  Api.sendMessage({ chat_id: target_chat, text: "<b>❌ GIVEAWAY ENDED</b>", parse_mode: "HTML" });
  return;
}

giveaway.users = giveaway.users || {};
giveaway.vote_counts = giveaway.vote_counts || {};
giveaway.vote_messages = giveaway.vote_messages || {};

var already_joined = !!(giveaway.users[uid]);
if (!already_joined && giveaway.participants) {
  for (var i = 0; i < giveaway.participants.length; i++) {
    if (giveaway.participants[i].id == uid) {
      already_joined = true;
      break;
    }
  }
}

var already_posted = !!(giveaway.vote_messages[uid]);

// If user is already joined
if (already_joined && action !== "join") {
  var status_note = already_posted ? "✅ Already posted in channel!" : "⚠️ Not posted yet — POST button dabao";
  var already_text = 
    "<b>🌟 ALREADY PARTICIPATED!</b>\n\n" +
    "<b>Your ID:</b> <code>" + uid + "</code>\n" +
    "<b>Status:</b> " + status_note;

  var already_buttons = [
    [{ text: "POST MY VOTE MSG", callback_data: "join_giveaway join " + gid, style: "success" }]
  ];

  Api.sendMessage({
    chat_id: target_chat,
    text: already_text,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: already_buttons }
  });
  return;
}

var ch_disp = giveaway.channel_display || giveaway.channel || "Channel";
var full_name = (user.first_name || "User") + (user.last_name ? (" " + user.last_name) : "");
var uname = user.username ? ("@" + user.username) : "No username";

// Action = JOIN (Register participant and post to channel)
if (action === "join") {
  giveaway.users[uid] = full_name;
  giveaway.vote_counts[uid] = giveaway.vote_counts[uid] || 0;

  // Post participant message to channel
  var card_text = 
    "<b>🎯 PARTICIPANT</b>\n\n" +
    "<b>👤 Name:</b> " + full_name + "\n" +
    "<b>🆔 ID:</b> <code>" + uid + "</code>\n" +
    "<b>📍 Username:</b> " + uname + "\n\n" +
    "<i>Vote karne ke liye neeche button dabao!</i>";

  var card_buttons = [
    [{ text: "Vote - " + (giveaway.vote_counts[uid] || 0), callback_data: "vote " + gid + " " + uid, style: "success" }]
  ];

  Api.sendMessage({
    chat_id: giveaway.channel,
    text: card_text,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: card_buttons },
    on_result: "on_channel_post_success"
  });

  all_giveaways[gid] = giveaway;
  Bot.setProperty("all_giveaways", all_giveaways, "json");

  var j_cnt = User.getProperty("giveaways_joined", 0);
  User.setProperty("giveaways_joined", j_cnt + 1, "integer");

  var reg_text = 
    "✅ <b>Registration Successful!</b>\n\n" +
    full_name + "\n" +
    "<code>" + uid + "</code>\n\n" +
    "<i>Channel me tumhara voting message post ho gaya.</i>";

  Api.sendMessage({
    chat_id: target_chat,
    text: reg_text,
    parse_mode: "HTML"
  });
  return;
}

// Default Landing Screen for Giveaway Link (Matching Python Bot)
var ch_raw = giveaway.channel || "";
var ch_url = ch_raw.indexOf("@") === 0 ? ("https://t.me/" + ch_raw.replace("@", "")) : ("https://t.me/" + BOT_USERNAME + "?startchannel=true");

var count = Object.keys(giveaway.users).length;

var prize_line = (giveaway.title || giveaway.prize) ? ("🏆 <b>Prize:</b> " + (giveaway.title || giveaway.prize) + "\n") : "";
var landing_text = 
  "<b>🎁 EXCLUSIVE GIVEAWAY</b>\n\n" +
  "<b>Hosted By:</b> " + ch_disp + "\n" +
  prize_line +
  "<b>Participants:</b> " + count + "\n\n" +
  "<b>✅ You are eligible!</b>";

var landing_buttons = [
  [{ text: "JOIN CHANNEL", url: ch_url, style: "success" }],
  [{ text: "JOIN GIVEAWAY", callback_data: "join_giveaway join " + gid, style: "success" }]
];

Api.sendMessage({
  chat_id: target_chat,
  text: landing_text,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: landing_buttons }
});
