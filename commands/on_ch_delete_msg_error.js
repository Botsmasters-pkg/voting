/*CMD
  command: on_ch_delete_msg_error
  help: Callback when message deletion fails
  need_reply: false
CMD*/

var mid = params || "Message";
var text = 
  "⚠️ <b>Delete Failed!</b>\n\n" +
  "Message <code>" + mid + "</code> delete nahi ho saka.\n\n" +
  "<b>Sambhavit Wajah:</b>\n" +
  "1. Message pehle se delete ho chuka hai ya Message ID galat hai.\n" +
  "2. Bot ke paas 'Delete Messages' permission nahi hai.\n" +
  "3. Message 48 ghante se zyada purana hai.";

var buttons = [
  [{ title: "🔙 Channel Tools", text: "🔙 Channel Tools", command: "ch_panel", callback_data: "ch_panel" }]
];

Bot.sendInlineKeyboard(buttons, text, { parse_mode: "HTML" });
