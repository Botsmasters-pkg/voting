/*CMD
  command: on_ch_delete_msg_result
  help: Callback when message is successfully deleted
  need_reply: false
CMD*/

var mid = params || "Message";
var active_channel = User.getProperty("active_channel");

var text = 
  "✅ <b>MESSAGE DELETED!</b> 🗑\n\n" +
  "📢 <b>Channel:</b> <code>" + active_channel + "</code>\n" +
  "🆔 <b>Message ID:</b> <code>" + mid + "</code>\n\n" +
  "Message safalta-purvak channel se delete kar diya gaya hai.";

var buttons = [
  [{ title: "🔙 Channel Tools", text: "🔙 Channel Tools", command: "ch_panel", callback_data: "ch_panel", style: "primary" }]
];

Bot.sendInlineKeyboard(buttons, text, { parse_mode: "HTML" });
