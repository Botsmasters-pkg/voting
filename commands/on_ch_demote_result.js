/*CMD
  command: on_ch_demote_result
  help: Callback on successful user demotion
  need_reply: false
CMD*/

var target_uid = params || "User";
var active_channel = User.getProperty("active_channel");

var text = 
  "✅ <b>USER DEMOTED SUCCESSFULLY!</b>\n\n" +
  "👤 <b>User ID:</b> <code>" + target_uid + "</code>\n" +
  "🆔 <b>Channel:</b> <code>" + active_channel + "</code>\n\n" +
  "User ki saari Admin privileges remove kar di gayi hain.";

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
