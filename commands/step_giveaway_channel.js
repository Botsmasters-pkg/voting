/*CMD
  command: step_giveaway_channel
  help: Process channel identifier input
  need_reply: true
CMD*/

if (!message) {
  Bot.sendMessage("⚠️ Kripya valid channel username ya ID bhejein.");
  Bot.runCommand("step_giveaway_channel");
  return;
}

if (message === "/start" || message.toLowerCase() === "cancel") {
  Bot.runCommand("/start");
  return;
}

var channel_input = message.trim();
User.setProperty("temp_giveaway_channel", channel_input, "string");

var text = 
  "✅ <b>Channel Saved:</b> <code>" + channel_input + "</code>\n\n" +
  "<b>Step 2:</b> Contest ka <b>Title / Prize Description</b> likhein.\n\n" +
  "<i>Example:</i> 🎁 <b>Photo Contest 2026 - Winner gets ₹1000!</b>";

var buttons = [
  [{ text: "🔙 Cancel", callback_data: "/start", style: "primary" }]
];

Bot.sendInlineKeyboard(buttons, text, { parse_mode: "HTML" });
Bot.runCommand("step_giveaway_title");\n