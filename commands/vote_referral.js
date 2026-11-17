/*CMD
  command: vote_referral
  help: Process participant personal referral vote link (https://t.me/bot?start=vote_GID_UID)
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

var raw = (options && options.raw) ? options.raw : (params || "").trim();
raw = raw.replace(/^vote_/i, "").trim();

var parts = raw.split("_");
if (parts.length < 2) {
  Bot.sendMessage("⚠️ Invalid Vote Referral Link.");
  Bot.runCommand("/start");
  return;
}

var gid = parts[0].trim();
var target_uid = parts[1].trim();

var all_giveaways = getPropJson("all_giveaways", {});
var giveaway = all_giveaways[gid];
var target_chat = (chat && chat.chatid) ? chat.chatid : user.telegramid;
var voter_id = user.telegramid;

if (!giveaway) {
  Api.sendMessage({ chat_id: target_chat, text: "❌ <b>Contest not found ya delete ho chuka hai.</b>", parse_mode: "HTML" });
  return;
}

if (giveaway.ended || giveaway.status === "ended") {
  Api.sendMessage({ chat_id: target_chat, text: "🛑 <b>Ye Contest END ho chuka hai. Ab voting band hai.</b>", parse_mode: "HTML" });
  return;
}

var users = giveaway.users || {};
var vote_counts = giveaway.vote_counts || {};

var p_name = users[target_uid] || ("Participant " + target_uid);
var p_votes = vote_counts[target_uid] || 0;
var prize_title = giveaway.title || giveaway.prize || ("Contest #" + gid);
var ch_name = giveaway.channel_display || giveaway.channel || "Channel";

var ch_url = (giveaway.channel && giveaway.channel.startsWith("@")) ? 
  ("https://t.me/" + giveaway.channel.replace("@", "")) : 
  ("https://t.me/" + Bot.getProperty("bot_username", "bot") + "?startchannel=true");

var is_self = (String(voter_id) === String(target_uid));

var text = "";
var buttons = [];

if (is_self) {
  var bot_uname = Bot.getProperty("bot_username", "bot");
  var my_ref_link = "https://t.me/" + bot_uname + "?start=vote_" + gid + "_" + target_uid;
  var share_url = "https://t.me/share/url?url=" + encodeURIComponent(my_ref_link) + "&text=" + encodeURIComponent("🔥 Mujhe is Contest me Vote karein! Link par click karke Vote button dabayein:");

  text = 
    "🌟 <b>AAPKA CONTEST CARD</b> 🌟\n\n" +
    "🏆 <b>Contest:</b> " + prize_title + "\n" +
    "📢 <b>Channel:</b> <code>" + ch_name + "</code>\n\n" +
    "👤 <b>Name:</b> " + p_name + "\n" +
    "🆔 <b>Your ID:</b> <code>" + target_uid + "</code>\n" +
    "🗳 <b>Current Votes:</b> <code>" + p_votes + " Votes</code>\n\n" +
    "🔗 <b>Aapka Personal Vote Link:</b>\n" +
    "<code>" + my_ref_link + "</code>\n\n" +
    "<i>Is link ko doston aur groups me share karein taaki wo direct aapko vote karein!</i>";

  buttons = [
    [{ text: "📤 Share Vote Link With Friends", url: share_url, style: "success" }],
    [{ text: "📈 My Stats", callback_data: "my_stats", style: "primary" }],
    [{ text: "🔙 Main Menu", callback_data: "/start", style: "primary" }]
  ];
} else {
  text = 
    "🗳 <b>VOTE FOR PARTICIPANT</b> 🗳\n\n" +
    "Aapko <b>" + p_name + "</b> ko vote dene ke liye invite kiya gaya hai!\n\n" +
    "🏆 <b>Contest:</b> " + prize_title + "\n" +
    "📢 <b>Channel:</b> <code>" + ch_name + "</code>\n" +
    "👤 <b>Participant:</b> <b>" + p_name + "</b>\n" +
    "🗳 <b>Current Votes:</b> <code>" + p_votes + " Votes</code>\n\n" +
    "✨ <i>Inhein vote dene ke liye neeche green button dabayein! (Dhyan dein: Channel join karna zaroori hai)</i>";

  buttons = [
    [
      { text: "🗳 Vote for " + (p_name.length > 15 ? (p_name.substring(0, 13) + "..") : p_name), callback_data: "vote " + gid + " " + target_uid, style: "success" }
    ],
    [
      { text: "📢 View Channel", url: ch_url, style: "primary" },
      { text: "🎯 Join Contest Too", callback_data: "join_giveaway join " + gid, style: "primary" }
    ],
    [
      { text: "🔙 Main Menu", callback_data: "/start", style: "primary" }
    ]
  ];
}

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
