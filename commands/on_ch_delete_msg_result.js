/*CMD
  command: on_ch_delete_msg_result
  help: Callback when message is successfully deleted
  need_reply: false
CMD*/

var mid = params || "Message";
var active_channel = User.getProperty("active_channel");

var text = 
  "✅ <b>MESSAGE DELETED!</b> 🗑\n\n" +
  "🆔 <b>Channel:</b> <code>" + active_channel + "</code>\n" +
  "🆔 <b>Message ID:</b> <code>" + mid + "</code>\n\n" +
  "Message safalta-purvak channel se delete kar diya gaya hai.";

var buttons = [
  [{ text: "🔙 Back to Channel Panel", callback_data: "ch_view " + active_channel, style: "primary" }]
];

var target_chat = (chat && chat.chatid) ? chat.chatid : user.telegramid;

Api.sendMessage({
  chat_id: target_chat,
  text: text,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: buttons }
});
