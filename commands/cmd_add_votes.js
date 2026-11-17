/*CMD
  command: cmd_add_votes
  help: Prompt for adding votes exactly matching Python bot
  need_reply: false
CMD*/

if (request && request.callback_query) {
  Api.answerCallbackQuery({
    callback_query_id: request.callback_query.id
  });
}

var raw = (options && options.giveaway_id) ? options.giveaway_id : (params || "").trim();
var gid = String(raw).replace(/^cmd_add_votes\s*/i, "").replace(/^addvotes_/i, "").trim();

if (!gid) {
  Bot.runCommand("my_giveaways");
  return;
}

User.setProperty("vote_giveaway", gid, "string");
User.setProperty("vote_action", "add", "string");

var text = "<b>💎 ADD VOTES</b>\n\nSend: <code>USER_ID VOTES</code>";

var buttons = [
  [{ text: "BACK", callback_data: "manage_giveaway " + gid, style: "primary" }]
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
