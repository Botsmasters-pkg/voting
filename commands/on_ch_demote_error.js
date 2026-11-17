/*CMD
  command: on_ch_demote_error
  help: Callback when user demotion fails
  need_reply: false
CMD*/

var target_uid = params || "User";
var text = 
  "⚠️ <b>Demotion Failed!</b>\n\n" +
  "Bot user <code>" + target_uid + "</code> ko demote nahi kar paya.\n\n" +
  "<i>Check karein ki bot ke paas 'Add new admins' rights hain aur user pehle se admin hai ya nahi.</i>";

var buttons = [
  [{ title: "🔙 Channel Tools", text: "🔙 Channel Tools", command: "ch_panel", callback_data: "ch_panel" }]
];

Bot.sendInlineKeyboard(buttons, text, { parse_mode: "HTML" });
