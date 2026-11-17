/*CMD
  command: step_giveaway_channel
  help: Process channel input, verify 1 active contest rule, and prompt for Prize/Title (Step 2)
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

function getPropJson(name, default_val) {
  var val = Bot.getProperty(name);
  if (!val) return default_val;
  if (typeof val === "object") return val;
  if (typeof val === "string") {
    try { return JSON.parse(val) || default_val; } catch (e) { return default_val; }
  }
  return default_val;
}

var channel_input = message.trim();

// Normalize URL or plain username to valid Telegram chat identifier (@channel or -100xxx)
if (channel_input.indexOf("t.me/") !== -1) {
  var uname_extracted = channel_input.split("t.me/")[1].split("/")[0].replace("@", "").trim();
  if (uname_extracted.indexOf("+") !== 0 && uname_extracted) {
    channel_input = "@" + uname_extracted;
  }
} else if (channel_input.indexOf("@") === -1 && !channel_input.startsWith("-") && isNaN(channel_input)) {
  channel_input = "@" + channel_input;
}

var all_giveaways = getPropJson("all_giveaways", {});
var target_lower = channel_input.toLowerCase();
var target_uname = target_lower.startsWith("@") ? target_lower.substring(1) : target_lower;

var target_chat = (chat && chat.chatid) ? chat.chatid : user.telegramid;

// Check 1 Active Contest Per Channel Rule (Only block if contest is currently active, ignore ended)
var existing_active = null;
for (var egid in all_giveaways) {
  var eg = all_giveaways[egid];
  if (eg && !eg.ended && eg.status !== "ended") {
    var eg_ch = String(eg.channel || "").toLowerCase();
    var eg_uname = eg_ch.startsWith("@") ? eg_ch.substring(1) : eg_ch;
    if (eg_ch === target_lower || (target_uname && eg_uname === target_uname)) {
      existing_active = eg;
      break;
    }
  }
}

if (existing_active) {
  var error_msg = 
    "🚫 <b>IS CHANNEL ME PEHLE SE CONTEST ACTIVE HAI!</b> 🚫\n\n" +
    "📢 <b>Channel:</b> <code>" + channel_input + "</code>\n" +
    "🏆 <b>Active Contest:</b> " + (existing_active.title || existing_active.id) + "\n" +
    "🆔 <b>Contest ID:</b> <code>#" + existing_active.id + "</code>\n\n" +
    "⚠️ <i>Ek channel me ek time par sirf ek hi contest chal sakta hai.</i>\n\n" +
    "Naya contest shuru karne se pehle puraana contest <b>END</b> karein!";

  var error_buttons = [
    [{ text: "⚙️ Manage Active Contest", callback_data: "manage_giveaway " + existing_active.id, style: "primary" }],
    [{ text: "🔙 Main Menu", callback_data: "/start", style: "primary" }]
  ];

  Api.sendMessage({
    chat_id: target_chat,
    text: error_msg,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: error_buttons }
  });
  return;
}

// Save channel temporarily for Step 2
User.setProperty("temp_giveaway_channel", channel_input, "string");

// Auto-register channel into connected_channels for Admin Control Suite
var channels = getPropJson("connected_channels", {});
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

// Fetch live Telegram chat details to enrich channel info
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

Api.sendMessage({
  chat_id: target_chat,
  text: text,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: buttons }
});

Bot.runCommand("step_giveaway_title");
