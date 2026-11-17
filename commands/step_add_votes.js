/*CMD
  command: step_add_votes
  help: Process adding votes exactly matching Python bot
  need_reply: true
CMD*/

var gid = User.getProperty("vote_giveaway");
if (!gid) {
  Bot.runCommand("my_giveaways");
  return;
}

if (!message) {
  Bot.sendMessage("🚨 Invalid! Send <code>USER_ID VOTES</code>.", { parse_mode: "HTML" });
  Bot.runCommand("step_add_votes");
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
  Bot.runCommand("step_add_votes");
  return;
}

var target_uid = parts[0].trim();
var votes = parseInt(parts[1].trim(), 10);

if (isNaN(votes) || votes <= 0) {
  Bot.sendMessage("🚨 Invalid! Send <code>USER_ID VOTES</code>.", { parse_mode: "HTML" });
  Bot.runCommand("step_add_votes");
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

// Verify participant exists in giveaway
var user_exists = !!(giveaway.users[target_uid]);
if (!user_exists && giveaway.participants) {
  for (var i = 0; i < giveaway.participants.length; i++) {
    if (giveaway.participants[i].id == target_uid) {
      user_exists = true;
      break;
    }
  }
}

if (!user_exists) {
  giveaway.users[target_uid] = "User " + target_uid;
}

var old = giveaway.vote_counts[target_uid] || 0;
giveaway.vote_counts[target_uid] = old + votes;
var new_votes = giveaway.vote_counts[target_uid];

all_giveaways[gid] = giveaway;
Bot.setProperty("all_giveaways", all_giveaways, "json");

// Update channel button in real-time
var target_channel = giveaway.channel_chat_id || giveaway.channel;
var mid = giveaway.vote_messages ? (giveaway.vote_messages[target_uid] || giveaway.vote_messages[String(target_uid)] || giveaway.vote_messages[Number(target_uid)]) : null;

var channel_synced = false;
if (mid && target_channel) {
  var new_markup = {
    inline_keyboard: [[
      { text: "Vote - " + new_votes, callback_data: "vote " + gid + " " + target_uid, style: "success" }
    ]]
  };
  Api.editMessageReplyMarkup({
    chat_id: target_channel,
    message_id: mid,
    reply_markup: new_markup,
    on_error: "on_channel_post_error"
  });
  channel_synced = true;
}

var reply_text = 
  "💎 <b>Added +" + votes + " votes!</b>\n" +
  "<b>New Total:</b> " + new_votes + "\n\n" +
  (channel_synced ? "✅ <i>Channel button updated in real-time!</i>" : "ℹ️ <i>Channel button update queued (channel message ID link hone par auto-sync ho jayega).</i>");
var buttons = [
  [{ text: "BACK", callback_data: "manage_giveaway " + gid, style: "primary" }]
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
