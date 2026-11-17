/*CMD
  command: manage_giveaway
  help: Contest Management Panel with Add Votes, Remove Votes, Leaderboard, and End Giveaway
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

var gid = (params || "").trim();
if (!gid) {
  Bot.runCommand("my_giveaways");
  return;
}

var all_giveaways = getPropJson("all_giveaways", {});
var giveaway = all_giveaways[gid];

if (!giveaway) {
  Bot.sendMessage("❌ Contest data nahi mila ya delete ho chuka hai.");
  Bot.runCommand("my_giveaways");
  return;
}

var uid = user.telegramid;
// Verify permission: only creator or bot owner can manage
if (uid != OWNER_ID && giveaway.creator_id != uid) {
  Bot.sendMessage("🚫 Access Denied: Aap is contest ke creator nahi hain.");
  return;
}

var p_count = giveaway.participants ? giveaway.participants.length : 0;
var total_v = 0;
if (giveaway.vote_counts) {
  for (var k in giveaway.vote_counts) {
    total_v += giveaway.vote_counts[k];
  }
}

var status_str = (giveaway.status === "ended") ? "🔴 ENDED" : "🟢 ACTIVE";
var bot_uname = Bot.getProperty("bot_username", "bot");
var join_url = "https://t.me/" + bot_uname + "?start=join_" + gid;

var text = 
  "⚡ <b>CONTEST MANAGEMENT PANEL</b> ⚡\n\n" +
  "🏆 <b>Title:</b> " + giveaway.title + "\n" +
  "🆔 <b>Contest ID:</b> <code>" + gid + "</code>\n" +
  "📢 <b>Channel:</b> <code>" + giveaway.channel + "</code>\n" +
  "📊 <b>Status:</b> <b>" + status_str + "</b>\n" +
  "👥 <b>Total Participants:</b> <code>" + p_count + "</code>\n" +
  "🗳 <b>Total Votes:</b> <code>" + total_v + "</code>\n\n" +
  "🔗 <b>Direct Join Link:</b>\n<code>" + join_url + "</code>\n\n" +
  "<i>Neeche diye gaye buttons se contest ko control karein 👇</i>";

var buttons = [
  [
    { text: "➕ ADD VOTES", callback_data: "cmd_add_votes " + gid, style: "success" },
    { text: "➖ REMOVE VOTES", callback_data: "cmd_remove_votes " + gid, style: "primary" }
  ],
  [
    { text: "🏆 LEADERBOARD", callback_data: "cmd_leaderboard " + gid, style: "primary" }
  ]
];

if (giveaway.status !== "ended") {
  buttons.push([
    { text: "🛑 END GIVEAWAY", callback_data: "cmd_end_giveaway " + gid, style: "primary" }
  ]);
}

buttons.push([
  { text: "🔙 Back to Contests", callback_data: "my_giveaways", style: "primary" }
]);

var target_chat = (chat && chat.chatid) ? chat.chatid : user.telegramid;

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
