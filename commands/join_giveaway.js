/*CMD
  command: join_giveaway
  help: Handle giveaway link and participant entry with strict single-entry guard
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
giveaway.participants = giveaway.participants || [];
giveaway.vote_counts = giveaway.vote_counts || {};
giveaway.vote_messages = giveaway.vote_messages || {};

// STRICT CHECK: User already joined
var already_joined = false;
if (giveaway.users[uid] || giveaway.users[String(uid)]) {
  already_joined = true;
}
if (!already_joined && giveaway.participants) {
  for (var i = 0; i < giveaway.participants.length; i++) {
    if (giveaway.participants[i].id == uid || String(giveaway.participants[i].id) === String(uid)) {
      already_joined = true;
      break;
    }
  }
}

// IF ALREADY JOINED: Block completely, DO NOT post to channel
if (already_joined) {
  var cur_votes = (giveaway.vote_counts[uid] || giveaway.vote_counts[String(uid)]) || 0;
  var participant_name = giveaway.users[uid] || giveaway.users[String(uid)] || (user.first_name || "User");
  
  var already_text = 
    "🌟 <b>ALREADY PARTICIPATED!</b> 🌟\n\n" +
    "Aap is contest me <b>pehle hi participate kar chuke hain!</b>\n\n" +
    "👤 <b>Name:</b> " + participant_name + "\n" +
    "🆔 <b>Your ID:</b> <code>" + uid + "</code>\n" +
    "🗳 <b>Current Votes:</b> <code>" + cur_votes + " Votes</code>\n\n" +
    "⚠️ <i>Aapka participant card channel me already post ho chuka hai. Ek user sirf ek hi baar participate kar sakta hai.</i>";

  var already_buttons = [
    [{ text: "📈 My Stats", callback_data: "my_stats", style: "primary" }],
    [{ text: "🔙 Main Menu", callback_data: "/start", style: "primary" }]
  ];

  if (request && request.callback_query && request.callback_query.message) {
    Api.editMessageText({
      chat_id: request.callback_query.message.chat.id,
      message_id: request.callback_query.message.message_id,
      text: already_text,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: already_buttons }
    });
  } else {
    Api.sendMessage({
      chat_id: target_chat,
      text: already_text,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: already_buttons }
    });
  }
  return;
}

var ch_disp = giveaway.channel_display || giveaway.channel || "Channel";
var full_name = (user.first_name || "User") + (user.last_name ? (" " + user.last_name) : "");
var uname = user.username ? ("@" + user.username) : "No username";
var prize_line = (giveaway.title || giveaway.prize) ? ("🏆 <b>Prize:</b> " + (giveaway.title || giveaway.prize) + "\n") : "";

// Action = JOIN (Fresh first-time participant entry)
if (action === "join") {
  // Save user immediately to avoid duplicate clicks
  giveaway.users[uid] = full_name;
  giveaway.vote_counts[uid] = 0;
  giveaway.participants.push({
    id: uid,
    name: full_name,
    username: user.username || null,
    joined_at: new Date().toISOString()
  });

  // Post participant message to channel ONCE
  var card_text = 
    "🎯 <b>NEW PARTICIPANT JOINED!</b>\n\n" +
    prize_line +
    "👤 <b>Name:</b> " + full_name + "\n" +
    "🆔 <b>ID:</b> <code>" + uid + "</code>\n" +
    "📍 <b>Username:</b> " + uname + "\n\n" +
    "<i>Vote karne ke liye neeche button dabao!</i> 👇";

  var card_buttons = [
    [{ text: "Vote - 0", callback_data: "vote " + gid + " " + uid, style: "success" }]
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
    "🎉 <b>Registration Successful!</b>\n\n" +
    "Aap contest me successfully enter ho gaye hain!\n\n" +
    "👤 <b>Name:</b> " + full_name + "\n" +
    "🆔 <b>ID:</b> <code>" + uid + "</code>\n\n" +
    "✅ <i>Channel me aapka voting message post ho gaya hai. Ab aap apne friends ko channel se vote karne ke liye bol sakte hain!</i>";

  var reg_buttons = [
    [{ text: "📈 My Stats", callback_data: "my_stats", style: "primary" }],
    [{ text: "🔙 Main Menu", callback_data: "/start", style: "primary" }]
  ];

  if (request && request.callback_query && request.callback_query.message) {
    Api.editMessageText({
      chat_id: request.callback_query.message.chat.id,
      message_id: request.callback_query.message.message_id,
      text: reg_text,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: reg_buttons }
    });
  } else {
    Api.sendMessage({
      chat_id: target_chat,
      text: reg_text,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: reg_buttons }
    });
  }
  return;
}

// Default Landing Screen for Giveaway Link (First time visitor)
var ch_raw = giveaway.channel || "";
var ch_url = ch_raw.indexOf("@") === 0 ? ("https://t.me/" + ch_raw.replace("@", "")) : ("https://t.me/" + BOT_USERNAME + "?startchannel=true");
var count = Object.keys(giveaway.users).length;

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

if (request && request.callback_query && request.callback_query.message) {
  Api.editMessageText({
    chat_id: request.callback_query.message.chat.id,
    message_id: request.callback_query.message.message_id,
    text: landing_text,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: landing_buttons }
  });
} else {
  Api.sendMessage({
    chat_id: target_chat,
    text: landing_text,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: landing_buttons }
  });
}
