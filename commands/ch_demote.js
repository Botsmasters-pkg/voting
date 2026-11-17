/*CMD
  command: ch_demote
  help: Ask for user ID to demote from Admin
  need_reply: false
CMD*/

var active_channel = User.getProperty("active_channel");
if (!active_channel) {
  Bot.runCommand("channel_tools");
  return;
}

var text = 
  "⬇️ <b>DEMOTE ADMIN TO MEMBER</b>\n\n" +
  "📢 <b>Channel:</b> <code>" + active_channel + "</code>\n\n" +
  "User ka <b>Telegram Numeric User ID</b> bhejo jisko Demote karna hai (Admin privileges hatani hain).\n\n" +
  "Cancel karne ke liye <code>cancel</code> likhein.";

var buttons = [
  [{ title: "🔙 Cancel", text: "🔙 Cancel", command: "ch_panel", callback_data: "ch_panel", style: "primary" }]
];

Bot.sendInlineKeyboard(buttons, text, { parse_mode: "HTML" });
Bot.runCommand("step_ch_demote");
