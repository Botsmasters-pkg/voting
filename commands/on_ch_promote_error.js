/*CMD
  command: on_ch_promote_error
  help: Callback when user promotion fails
  need_reply: false
CMD*/

var target_uid = params || "User";
var active_channel = User.getProperty("active_channel");

var text = 
  "⚠️ <b>Promotion Failed!</b>\n\n" +
  "Bot user <code>" + target_uid + "</code> ko promote nahi kar paya.\n\n" +
  "<b>Sambhavit Wajah:</b>\n" +
  "1. Bot ke paas 'Add new admins' permission nahi hai.\n" +
  "2. User pehle se channel me nahi hai ya ID galat hai.";

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
