/*CMD
  command: step_giveaway_channel
  help: Process channel identifier input with auto-detection, live chat verification, and 1-active-contest-per-channel rule
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
var all_giveaways = getPropJson("all_giveaways", {});
var target_lower = channel_input.toLowerCase();
var target_uname = target_lower.startsWith("@") ? target_lower.substring(1) : target_lower;

// Check 1 Active Contest Per Channel Rule
var existing_active = null;

for (var gid in all_giveaways) {
  var g = all_giveaways[gid];
  if (g && g.status === "active") {
    var g_ch = String(g.channel || "").toLowerCase();
    var g_uname = g_ch.startsWith("@") ? g_ch.substring(1) : g_ch;
    
    if (g_ch === target_lower || (target_uname && g_uname === target_uname)) {
      existing_active = g;
      break;
    }
  }
}

var target_chat = (chat && chat.chatid) ? chat.chatid : user.telegramid;

if (existing_active) {
  var error_msg = 
    "🚫 <b>IS CHANNEL ME PEHLE SE CONTEST ACTIVE HAI!</b> 🚫\n\n" +
    "📢 <b>Channel:</b> <code>" + channel_input + "</code>\n" +
    "🏆 <b>Active Contest:</b> " + existing_active.title + "\n" +
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

User.setProperty("temp_giveaway_channel", channel_input, "string");

// Immediately auto-register channel into connected_channels safely
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

// Fetch live Telegram chat details to get numeric ID, title and notify owner
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
