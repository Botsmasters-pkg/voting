/*CMD
  command: ch_panel
  help: Display Channel Management Control Panel
  need_reply: false
CMD*/

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
    { text: "🔗 Get Channel Link", callback_data: "ch_get_link", style: "success" }
  ],
  [
    { text: "⬆️ Promote User", callback_data: "ch_promote", style: "success" },
    { text: "⬇️ Demote User", callback_data: "ch_demote", style: "primary" }
  ],
  [
    { text: "🗑 Delete Message", callback_data: "ch_delete_msg", style: "primary" }
  ],
  [
    { text: "🔄 Switch Channel", callback_data: "ch_select_prompt", style: "primary" },
    { text: "🔙 Main Menu", callback_data: "/start", style: "primary" }
  ]
];

Bot.sendInlineKeyboard(buttons, text, { parse_mode: "HTML" });\n