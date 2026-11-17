/*CMD
  command: step_ch_select
  help: Validate and save channel to connected list
  need_reply: true
CMD*/

if (!message) {
  Bot.sendMessage("⚠️ Kripya valid channel username ya ID dalein.");
  Bot.runCommand("step_ch_select");
  return;
}

if (message === "/start" || message.toLowerCase() === "cancel") {
  Bot.runCommand("/admin");
  return;
}

var ch_input = message.trim();
User.setProperty("active_channel", ch_input, "string");

var channels = Bot.getProperty("connected_channels", {});
var chat_key = String(ch_input);

if (!channels[chat_key]) {
  channels[chat_key] = {
    id: chat_key,
    title: ch_input,
    username: ch_input.startsWith("@") ? ch_input.replace("@", "") : "",
    type: "channel",
    added_by: (user.first_name || "Admin"),
    added_by_id: user.telegramid,
    added_at: new Date().toISOString()
  };
  Bot.setProperty("connected_channels", channels, "json");
}

Bot.sendMessage("✅ <b>Channel Added:</b> <code>" + ch_input + "</code>", { parse_mode: "HTML" });
Bot.runCommand("ch_view " + ch_input);
