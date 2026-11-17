/*CMD
  command: create_giveaway
  help: Start contest creation wizard (Step 1: Channel Input)
  need_reply: false
CMD*/

if (request && request.callback_query) {
  Api.answerCallbackQuery({
    callback_query_id: request.callback_query.id
  });
}

// Reset creation states
User.setProperty("waiting_giveaway_channel", true, "boolean");
User.setProperty("waiting_giveaway_title", false, "boolean");

var text = 
  "🎯 <b>Create New Contest / Giveaway</b>\n\n" +
  "<b>Step 1:</b> Apne Telegram Channel ka username ya ID bhejo jisme contest karwana hai.\n\n" +
  "<i>Example:</i> <code>@MyContestChannel</code> ya <code>-1001234567890</code>\n\n" +
  "⚠️ <b>Dhyan dein:</b> Bot ko us channel me pehle <b>Admin</b> banana zaroori hai!";

var buttons = [
  [{ text: "🔙 Cancel", callback_data: "/start", style: "primary" }]
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
