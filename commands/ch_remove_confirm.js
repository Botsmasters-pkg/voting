/*CMD
  command: ch_remove_confirm
  help: Ask confirmation before removing channel from bot connected list
  need_reply: false
CMD*/

var target_chid = (params || "").trim();

var text = 
  "⚠️ <b>REMOVE CHANNEL FROM LIST?</b>\n\n" +
  "Kya aap channel <code>" + target_chid + "</code> ko bot ki list se hatana chahte hain?\n\n" +
  "<i>(Yeh sirf bot ki list se hatega, bot channel me rahega agar aap chahein)</i>";

var buttons = [
  [
    { text: "✅ Yes, Remove", callback_data: "ch_remove_do " + target_chid, style: "primary" },
    { text: "❌ Cancel", callback_data: "ch_view " + target_chid, style: "primary" }
  ]
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
