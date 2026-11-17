/*CMD
  command: channel_tools
  help: Channel admin tools menu (Get Link, Promote, Demote, Delete Message)
  need_reply: false
CMD*/

var my_channels = User.getProperty("my_channels", []);
var active_channel = User.getProperty("active_channel");

var text = 
  "🎛 <b>CHANNEL ADMIN TOOLS</b> 🎛\n\n" +
  "Aap is feature se apne channel ko bot ke zariye manage kar sakte hain:\n\n" +
  "🔗 <b>Get Link:</b> Channel ka invite link generate karein\n" +
  "⬆️ <b>Promote:</b> Kisi user ko channel me Admin banayein\n" +
  "⬇️ <b>Demote:</b> Admin privileges remove karein\n" +
  "🗑 <b>Delete Message:</b> Channel ka koi bhi message delete karein\n\n";

var buttons = [];

if (active_channel) {
  text += "📌 <b>Current Active Channel:</b> <code>" + active_channel + "</code>\n\n";
  buttons.push([
    { text: "⚙️ Open Active Channel Panel", callback_data: "ch_panel", style: "success" }
  ]);
}

buttons.push([
  { text: "➕ Select / Change Channel", callback_data: "ch_select_prompt", style: "success" }
]);

buttons.push([
  { text: "🔙 Main Menu", callback_data: "/start", style: "primary" }
]);

Bot.sendInlineKeyboard(buttons, text, { parse_mode: "HTML" });\n