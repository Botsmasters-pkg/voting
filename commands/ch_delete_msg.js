/*CMD
  command: ch_delete_msg
  help: Ask for message ID to delete from channel
  need_reply: false
CMD*/

var active_channel = User.getProperty("active_channel");
if (!active_channel) {
  Bot.runCommand("channel_tools");
  return;
}

var text = 
  "🗑 <b>DELETE CHANNEL MESSAGE</b>\n\n" +
  "📢 <b>Channel:</b> <code>" + active_channel + "</code>\n\n" +
  "Jo message delete karna hai uska <b>Message ID</b> bhejein (jaise <code>45</code> ya <code>128</code>).\n\n" +
  "<i>(Aap channel se wo message bot ko forward bhi kar sakte hain)</i>\n\n" +
  "Cancel karne ke liye <code>cancel</code> likhein.";

var buttons = [
  [{ title: "🔙 Cancel", text: "🔙 Cancel", command: "ch_panel", callback_data: "ch_panel" }]
];

Bot.sendInlineKeyboard(buttons, text, { parse_mode: "HTML" });
Bot.runCommand("step_ch_delete_msg");
