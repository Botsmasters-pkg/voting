/*CMD
  command: on_ch_get_link_error
  help: Callback when invite link creation fails
  need_reply: false
CMD*/

var err = options && options.error ? options.error : "Unknown";
var text = 
  "⚠️ <b>Link Generate Nahi Ho Paya!</b>\n\n" +
  "Bot ke paas channel ka invite link create karne ki permission nahi hai.\n\n" +
  "<i>Kripya check karein ki Bot channel me Admin hai aur 'Invite Users via Links' permission ON hai.</i>";

var buttons = [
  [{ title: "🔙 Back to Tools", text: "🔙 Back to Tools", command: "ch_panel", callback_data: "ch_panel", style: "primary" }]
];

Bot.sendInlineKeyboard(buttons, text, { parse_mode: "HTML" });
