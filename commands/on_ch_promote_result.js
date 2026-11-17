/*CMD
  command: on_ch_promote_result
  help: Callback on successful user promotion
  need_reply: false
CMD*/

var target_uid = params || "User";
var active_channel = User.getProperty("active_channel");

var text = 
  "✅ <b>USER PROMOTED TO ADMIN!</b> 🎉\n\n" +
  "👤 <b>User ID:</b> <code>" + target_uid + "</code>\n" +
  "📢 <b>Channel:</b> <code>" + active_channel + "</code>\n\n" +
  "User ko channel me Admin permissions de di gayi hain.";

var buttons = [
  [{ text: "🔙 Channel Tools", callback_data: "ch_panel", style: "primary" }]
];

Bot.sendInlineKeyboard(buttons, text, { parse_mode: "HTML" });\n