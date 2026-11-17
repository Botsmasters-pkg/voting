/*CMD
  command: step_giveaway_channel
  help: Process channel input, enforce 1 active contest rule, and create giveaway directly matching Python bot
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

var OWNER_ID = 8710308658;
var channel_input = message.trim();
var all_giveaways = getPropJson("all_giveaways", {});
var target_lower = channel_input.toLowerCase();
var target_uname = target_lower.startsWith("@") ? target_lower.substring(1) : target_lower;

// Dynamic Bot Username detected from token
var BOT_USERNAME = Bot.getProperty("bot_username");
if (!BOT_USERNAME) {
  var bInfo = getPropJson("bot_info", null);
  if (bInfo) {
    if (bInfo.result && bInfo.result.username) BOT_USERNAME = bInfo.result.username.replace("@", "");
    else if (bInfo.username) BOT_USERNAME = bInfo.username.replace("@", "");
  }
}
if (!BOT_USERNAME) {
  BOT_USERNAME = "bot";
}

var target_chat = (chat && chat.chatid) ? chat.chatid : user.telegramid;

// Check 1 Active Contest Per Channel Rule (Matching Python Bot)
var existing_active = null;
for (var egid in all_giveaways) {
  var eg = all_giveaways[egid];
  if (eg && (eg.status === "active" || !eg.ended)) {
    var eg_ch = String(eg.channel || "").toLowerCase();
    var eg_uname = eg_ch.startsWith("@") ? eg_ch.substring(1) : eg_ch;
    if (eg_ch === target_lower || (target_uname && eg_uname === target_uname)) {
      existing_active = eg;
      break;
    }
  }
}

if (existing_active) {
  var act_link = "https://t.me/" + BOT_USERNAME + "?start=" + existing_active.id;
  var act_text = 
    "<b>🚨 GIVEAWAY ALREADY ACTIVE!</b>\n\n" +
    "<b>Link:</b>\n" +
    "<code>" + act_link + "</code>";

  var act_buttons = [
    [{ text: "MANAGE", callback_data: "manage_giveaway " + existing_active.id, style: "primary" }],
    [{ text: "MAIN MENU", callback_data: "/start", style: "primary" }]
  ];

  Api.sendMessage({
    chat_id: target_chat,
    text: act_text,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: act_buttons }
  });
  return;
}

// Generate 8-character Alphanumeric Contest ID (Matching Python Bot)
function makeId(length) {
  var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  var result = "";
  for (var i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
var gid = makeId(8);

var user_full_name = (user.first_name || "User") + (user.last_name ? (" " + user.last_name) : "");

// Create Giveaway Object (Fully compatible with Python and Admin panel)
var giveaway = {
  id: gid,
  channel: channel_input,
  channel_display: channel_input,
  title: "Contest #" + gid,
  creator: user.telegramid,
  creator_id: user.telegramid,
  creator_name: user_full_name,
  created_at: new Date().toISOString(),
  ended: false,
  status: "active",
  users: {},
  participants: [],
  vote_counts: {},
  voted_users: {},
  vote_records: {},
  vote_messages: {}
};

all_giveaways[gid] = giveaway;
Bot.setProperty("all_giveaways", all_giveaways, "json");

// Update User Stats
var cr_count = User.getProperty("giveaways_created", 0);
User.setProperty("giveaways_created", cr_count + 1, "integer");

var my_list = User.getProperty("my_giveaway_ids", []);
my_list.push(gid);
User.setProperty("my_giveaway_ids", my_list, "json");

// Auto-register channel into connected_channels for Admin Channel Control Suite
var channels = getPropJson("connected_channels", {});
var ch_key = String(channel_input);
if (!channels[ch_key]) {
  channels[ch_key] = {
    id: ch_key,
    title: channel_input,
    username: channel_input.startsWith("@") ? channel_input.replace("@", "") : "",
    type: "channel",
    added_by: user_full_name,
    added_by_id: user.telegramid,
    added_at: new Date().toISOString()
  };
  Bot.setProperty("connected_channels", channels, "json");
}

// Query Telegram Chat Info asynchronously to enrich title & ID
Api.getChat({
  chat_id: channel_input,
  on_result: "on_channel_chat_info"
});

// Notify OWNER (Matching Python Bot)
var owner_alert = 
  "🔔 <b>NEW GIVEAWAY</b>\n\n" +
  "👤 " + user_full_name + "\n" +
  "🆔 <code>" + user.telegramid + "</code>\n" +
  "📢 " + channel_input;

Api.sendMessage({
  chat_id: OWNER_ID,
  text: owner_alert,
  parse_mode: "HTML"
});

// Reply to User (Matching Python Bot)
var link = "https://t.me/" + BOT_USERNAME + "?start=" + gid;
var success_text = 
  "<b>✅ GIVEAWAY CREATED!</b>\n\n" +
  "<b>ID:</b> <code>" + gid + "</code>\n" +
  "<b>Channel:</b> " + channel_input + "\n\n" +
  "<b>LINK:</b>\n" +
  "<code>" + link + "</code>";

var buttons = [
  [
    { text: "MANAGE", callback_data: "manage_giveaway " + gid, style: "primary" },
    { text: "MAIN MENU", callback_data: "/start", style: "primary" }
  ]
];

Api.sendMessage({
  chat_id: target_chat,
  text: success_text,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: buttons }
});
