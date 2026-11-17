/*CMD
  command: step_remove_votes
  help: Process removing votes exactly matching Python bot
  need_reply: true
CMD*/

var gid = User.getProperty("vote_giveaway");
if (!gid) {
  Bot.runCommand("my_giveaways");
  return;
}

if (!message) {
  Bot.sendMessage("🚨 Invalid! Send <code>USER_ID VOTES</code>.", { parse_mode: "HTML" });
  Bot.runCommand("step_remove_votes");
  return;
}

if (message === "/start" || message.toLowerCase() === "cancel") {
  Bot.runCommand("manage_giveaway " + gid);
  return;
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

var parts = message.trim().split(/\s+/);
if (parts.length < 2) {
  Bot.sendMessage("🚨 Invalid! Send <code>USER_ID VOTES</code>.", { parse_mode: "HTML" });
  Bot.runCommand("step_remove_votes");
  return;
}

var target_uid = parts[0].trim();
var votes = parseInt(parts[1].trim(), 10);

if (isNaN(votes) || votes <= 0) {
  Bot.sendMessage("🚨 Invalid! Send <code>USER_ID VOTES</code>.", { parse_mode: "HTML" });
  Bot.runCommand("step_remove_votes");
  return;
}

var all_giveaways = getPropJson("all_giveaways", {});
var giveaway = all_giveaways[gid];

if (!giveaway) {
  Bot.sendMessage("❌ Contest not found!");
  Bot.runCommand("my_giveaways");
  return;
}

giveaway.users = giveaway.users || {};
giveaway.vote_counts = giveaway.vote_counts || {};

var old = giveaway.vote_counts[target_uid] || 0;
giveaway.vote_counts[target_uid] = Math.max(0, old - votes);
var new_votes = giveaway.vote_counts[target_uid];

all_giveaways[gid] = giveaway;
Bot.setProperty("all_giveaways", all_giveaways, "json");

// Update channel button if message ID is known
if (giveaway.vote_messages && giveaway.vote_messages[target_uid] && giveaway.channel) {
  var new_markup = {
    inline_keyboard: [[
      { text: "Vote - " + new_votes, callback_data: "vote_" + gid + "_" + target_uid, style: "success" }
    ]]
  };
  Api.editMessageReplyMarkup({
    chat_id: giveaway.channel,
    message_id: giveaway.vote_messages[target_uid],
    reply_markup: new_markup
  });
}

var reply_text = "💎 Removed " + votes + " votes!\n<b>New Total:</b> " + new_votes;
var buttons = [
  [{ text: "BACK", callback_data: "manage_" + gid, style: "primary" }]
];

var target_chat = (chat && chat.chatid) ? chat.chatid : user.telegramid;
Api.sendMessage({
  chat_id: target_chat,
  text: reply_text,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: buttons }
});

User.setProperty("vote_giveaway", null, "string");
User.setProperty("vote_action", null, "string");
