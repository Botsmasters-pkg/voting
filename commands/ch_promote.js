/*CMD
  command: ch_promote
  help: Ask for user ID to promote as Admin
  need_reply: false
CMD*/

var active_channel = User.getProperty("active_channel");
if (!active_channel) {
  Bot.runCommand("channel_tools");
  return;
}

var text = 
  "⬆️ <b>PROMOTE USER TO ADMIN</b>\n\n" +
  "📢 <b>Channel:</b> <code>" + active_channel + "</code>\n\n" +
  "User ka <b>Telegram Numeric User ID</b> bhejo jisko Admin banana hai.\n\n" +
  "<i>Example:</i> <code>1234567890</code>\n\n" +
  "Cancel karne ke liye <code>cancel</code> likhein.";

var buttons = [
  [{ text: "🔙 Cancel", callback_data: "ch_panel", style: "primary" }]
];

Bot.sendInlineKeyboard(buttons, text, { parse_mode: "HTML" });
Bot.runCommand("step_ch_promote");\n