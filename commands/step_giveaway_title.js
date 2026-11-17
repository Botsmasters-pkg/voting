/*CMD
  command: step_giveaway_title
  help: Process contest prize/title and prompt for Step 3: Contest Duration / Deadline Timer
  need_reply: true
CMD*/

if (!message) {
  Bot.sendMessage("⚠️ Kripya contest ka Prize / Title enter karein.");
  Bot.runCommand("step_giveaway_title");
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

var channel_target = User.getProperty("temp_giveaway_channel");
if (!channel_target) {
  Bot.sendMessage("⚠️ Koi channel select nahi mila. Shuru se shuru karein.");
  Bot.runCommand("/start");
  return;
}

// Multi-step turn guard: If invoked in the same turn by step_giveaway_channel,
// do not consume channel_input as title. Arm the prompt and wait for user's actual reply!
if (User.getProperty("giveaway_title_ready") !== true) {
  User.setProperty("giveaway_title_ready", true, "boolean");
  return;
}
User.setProperty("giveaway_title_ready", false, "boolean");

var all_giveaways = getPropJson("all_giveaways", {});
var target_lower = String(channel_target).toLowerCase();
var target_uname = target_lower.startsWith("@") ? target_lower.substring(1) : target_lower;

// Enforce 1 active contest per channel (Ignore ended contests)
for (var egid in all_giveaways) {
  var eg = all_giveaways[egid];
  if (eg && !eg.ended && eg.status !== "ended") {
    var eg_ch = String(eg.channel || "").toLowerCase();
    var eg_uname = eg_ch.startsWith("@") ? eg_ch.substring(1) : eg_ch;
    if (eg_ch === target_lower || (target_uname && eg_uname === target_uname)) {
      Bot.sendMessage("🚫 <b>Error:</b> Is channel par pehle se active contest chal raha hai! Puraana contest END karne ke baad hi naya create karein.", { parse_mode: "HTML" });
      Bot.runCommand("manage_giveaway " + eg.id);
      return;
    }
  }
}

var title_input = message.trim();
User.setProperty("temp_giveaway_title", title_input, "string");

var target_chat = (chat && chat.chatid) ? chat.chatid : user.telegramid;

var timer_text = 
  "⏱ <b>Step 3: Contest Duration (Timer)</b> ⏱\n\n" +
  "🏆 <b>Prize:</b> " + title_input + "\n" +
  "📢 <b>Channel:</b> <code>" + channel_target + "</code>\n\n" +
  "Contest kitne samay tak chalana chahte hain? Neeche se samay chunein:\n\n" +
  "✨ <i>Timer khatam hote hi bot <b>automatically contest end</b> kar dega aur channel me winner declare kar dega!</i>";

var timer_buttons = [
  [
    { text: "⚡ 1 Hour", callback_data: "step_giveaway_duration 1h", style: "primary" },
    { text: "🕒 6 Hours", callback_data: "step_giveaway_duration 6h", style: "primary" }
  ],
  [
    { text: "⏳ 12 Hours", callback_data: "step_giveaway_duration 12h", style: "primary" },
    { text: "📅 24 Hours (1 Day)", callback_data: "step_giveaway_duration 24h", style: "success" }
  ],
  [
    { text: "📆 3 Days", callback_data: "step_giveaway_duration 72h", style: "primary" },
    { text: "♾ No Timer (Manual)", callback_data: "step_giveaway_duration 0", style: "primary" }
  ],
  [
    { text: "🔙 Cancel", callback_data: "/start", style: "primary" }
  ]
];

Api.sendMessage({
  chat_id: target_chat,
  text: timer_text,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: timer_buttons }
});
