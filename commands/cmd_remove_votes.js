/*CMD
  command: cmd_remove_votes
  help: Prompt for Participant User ID and number of votes to cut/remove
  need_reply: false
CMD*/

var gid = (params || "").trim();
if (!gid) {
  Bot.runCommand("my_giveaways");
  return;
}

User.setProperty("active_manage_gid", gid, "string");

var text = 
  "➖ <b>REMOVE / CUT VOTES FROM PARTICIPANT</b>\n\n" +
  "🆔 <b>Contest ID:</b> <code>" + gid + "</code>\n\n" +
  "Participant ka <b>User ID</b> aur <b>Kitne votes minus karne hain</b> space dekar bhejein:\n\n" +
  "<i>Example:</i> <code>1234567890 5</code>\n" +
  "<i>(Yeh user ID 1234567890 ke 5 votes cut kar dega)</i>\n\n" +
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

Bot.runCommand("step_remove_votes");
