/*CMD
  command: step_ch_select
  help: Validate and save active channel
  need_reply: true
CMD*/

if (!message) {
  Bot.sendMessage("⚠️ Kripya valid channel username ya ID dalein.");
  Bot.runCommand("step_ch_select");
  return;
}

if (message === "/start" || message.toLowerCase() === "cancel") {
  Bot.runCommand("/start");
  return;
}

var ch_input = message.trim();
User.setProperty("active_channel", ch_input, "string");

var my_channels = User.getProperty("my_channels", []);
if (my_channels.indexOf(ch_input) === -1) {
  my_channels.push(ch_input);
  User.setProperty("my_channels", my_channels, "json");
}

Bot.sendMessage("✅ <b>Channel Selected:</b> <code>" + ch_input + "</code>", { parse_mode: "HTML" });
Bot.runCommand("ch_panel");\n