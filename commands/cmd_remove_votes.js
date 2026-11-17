/*CMD
  command: cmd_remove_votes
  help: Prompt for removing votes exactly matching Python bot
  need_reply: false
CMD*/

var gid = (options && options.giveaway_id) ? options.giveaway_id : (params || "").trim();
if (gid.indexOf("removevotes_") === 0) {
  gid = gid.replace("removevotes_", "");
}

if (!gid) {
  Bot.runCommand("my_giveaways");
  return;
}

User.setProperty("vote_giveaway", gid, "string");
User.setProperty("vote_action", "remove", "string");

var text = "<b>💎 REMOVE VOTES</b>\n\nSend: <code>USER_ID VOTES</code>";

var buttons = [
  [{ text: "BACK", callback_data: "manage_" + gid, style: "primary" }]
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
