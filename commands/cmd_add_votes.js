/*CMD
  command: cmd_add_votes
  help: Prompt for Participant User ID and number of votes to add
  need_reply: false
CMD*/

var gid = (params || "").trim();
if (!gid) {
  Bot.runCommand("my_giveaways");
  return;
}

User.setProperty("active_manage_gid", gid, "string");

var text = 
  "➕ <b>ADD VOTES TO PARTICIPANT</b>\n\n" +
  "🆔 <b>Contest ID:</b> <code>" + gid + "</code>\n\n" +
  "Participant ka <b>User ID</b> aur <b>Votes ki sankhya</b> space dekar bhejein:\n\n" +
  "<i>Example:</i> <code>1234567890 10</code>\n" +
  "<i>(Yeh user ID 1234567890 ko 10 votes add kar dega)</i>\n\n" +
  "Cancel karne ke liye neeche button dabayein ya <code>cancel</code> type karein.";

var buttons = [
  [{ text: "🔙 Cancel", callback_data: "manage_giveaway " + gid, style: "primary" }]
];

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

Bot.runCommand("step_add_votes");
