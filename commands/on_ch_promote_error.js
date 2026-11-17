/*CMD
  command: on_ch_promote_error
  help: Callback when user promotion fails
  need_reply: false
CMD*/

var target_uid = params || "User";
var text = 
  "⚠️ <b>Promotion Failed!</b>\n\n" +
  "Bot user <code>" + target_uid + "</code> ko promote nahi kar paya.\n\n" +
  "<b>Sambhavit Wajah:</b>\n" +
  "1. Bot ke paas 'Add new admins' permission nahi hai.\n" +
  "2. User pehle se channel me nahi hai ya ID galat hai.";

var buttons = [
  [{ title: "🔙 Channel Tools", text: "🔙 Channel Tools", command: "ch_panel", callback_data: "ch_panel" }]
];

Bot.sendInlineKeyboard(buttons, text, { parse_mode: "HTML" });
