/*CMD
  command: create_giveaway
  help: Start giveaway creation wizard exactly matching Python bot
  need_reply: false
CMD*/

var text = 
  "⚡ <b>CREATE GIVEAWAY</b>\n\n" +
  "Send channel info:\n\n" +
  "<b>Public:</b> <code>@username</code>\n" +
  "<b>Private:</b> <code>-1001234567890</code>";

var buttons = [
  [{ text: "❌ CANCEL", callback_data: "go_back_home", style: "danger" }]
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

Bot.runCommand("step_giveaway_channel");
