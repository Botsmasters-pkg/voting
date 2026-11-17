/*CMD
  command: ch_panel
  help: Display Channel Management Control Panel
  need_reply: false
CMD*/

var OWNER_ID = 8710308658;
if (user.telegramid != OWNER_ID) {
  Bot.sendMessage("🚫 <b>Access Denied:</b> Sirf Admin access kar sakta hai.", { parse_mode: "HTML" });
  return;
}

var active_channel = User.getProperty("active_channel");

if (!active_channel) {
  Bot.runCommand("ch_select_prompt");
  return;
}

var text = 
  "🎛 <b>CHANNEL CONTROL PANEL</b> 🎛\n\n" +
  "📢 <b>Channel:</b> <code>" + active_channel + "</code>\n\n" +
  "Neeche diye gaye buttons se feature select karein 👇";

var buttons = [
  [
    { title: "🔗 Get Channel Link", text: "🔗 Get Channel Link", command: "ch_get_link", callback_data: "ch_get_link" }
  ],
  [
    { title: "⬆️ Promote User", text: "⬆️ Promote User", command: "ch_promote", callback_data: "ch_promote" },
    { title: "⬇️ Demote User", text: "⬇️ Demote User", command: "ch_demote", callback_data: "ch_demote" }
  ],
  [
    { title: "🗑 Delete Message", text: "🗑 Delete Message", command: "ch_delete_msg", callback_data: "ch_delete_msg" }
  ],
  [
    { title: "🔄 Switch Channel", text: "🔄 Switch Channel", command: "ch_select_prompt", callback_data: "ch_select_prompt" },
    { title: "🔙 Back to Admin", text: "🔙 Back to Admin", command: "/admin", callback_data: "/admin" }
  ]
];

Bot.sendInlineKeyboard(buttons, text, { parse_mode: "HTML" });
