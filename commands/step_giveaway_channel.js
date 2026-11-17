/*CMD
  command: step_giveaway_channel
  help: Process channel identifier input with primary styled cancel button
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

// Immediately auto-register channel into connected_channels
var channels = Bot.getProperty("connected_channels", {});
var ch_key = String(channel_input);
if (!channels[ch_key]) {
  channels[ch_key] = {
    id: ch_key,
    title: channel_input,
    username: channel_input.startsWith("@") ? channel_input.replace("@", "") : "",
    type: "channel",
    added_by: (user.first_name || "User"),
    added_by_id: user.telegramid,
    added_at: new Date().toISOString()
  };
  Bot.setProperty("connected_channels", channels, "json");
}

// Fetch live Telegram chat details to get numeric ID and title
Api.getChat({
  chat_id: channel_input,
  on_result: "on_channel_chat_info"
});

var text = 
  "✅ <b>Channel Saved:</b> <code>" + channel_input + "</code>\n\n" +
  "<b>Step 2:</b> Contest ka <b>Title / Prize Description</b> likhein.\n\n" +
  "<i>Example:</i> 🎁 <b>Photo Contest 2026 - Winner gets ₹1000!</b>";

var buttons = [
  [{ text: "🔙 Cancel", callback_data: "/start", style: "primary" }]
];

var target_chat = (chat && chat.chatid) ? chat.chatid : user.telegramid;

Api.sendMessage({
  chat_id: target_chat,
  text: text,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: buttons }
});

Bot.runCommand("step_giveaway_title");
