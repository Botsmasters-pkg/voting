/*CMD
  command: on_ch_demote_error
  help: Callback when user demotion fails
  need_reply: false
CMD*/

var target_uid = params || "User";
var active_channel = User.getProperty("active_channel");

var text = 
  "⚠️ <b>Demotion Failed!</b>\n\n" +
  "Bot user <code>" + target_uid + "</code> ko demote nahi kar paya.\n\n" +
  "<i>Check karein ki bot ke paas 'Add new admins' rights hain aur user pehle se admin hai ya nahi.</i>";

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
