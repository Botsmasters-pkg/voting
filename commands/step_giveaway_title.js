/*CMD
  command: step_giveaway_title
  help: Process contest prize/title, auto-post to channel, notify owner, and finalize creation
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

var all_giveaways = getPropJson("all_giveaways", {});
var target_lower = String(channel_target).toLowerCase();
var target_uname = target_lower.startsWith("@") ? target_lower.substring(1) : target_lower;

// Enforce 1 active contest per channel
for (var egid in all_giveaways) {
  var eg = all_giveaways[egid];
  if (eg && (eg.status === "active" || !eg.ended)) {
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

function makeId(length) {
  var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  var result = "";
  for (var i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
var gid = "G" + makeId(7);

var OWNER_ID = 8710308658;
var user_full_name = (user.first_name || "User") + (user.last_name ? (" " + user.last_name) : "");

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

// Auto-register channel into connected_channels
var channels = getPropJson("connected_channels", {});
var ch_key = String(channel_target);
if (!channels[ch_key]) {
  channels[ch_key] = {
    id: ch_key,
    title: channel_target,
    username: channel_target.startsWith("@") ? channel_target.replace("@", "") : "",
    type: "channel",
    added_by: user_full_name,
    added_by_id: user.telegramid,
    added_at: new Date().toISOString()
  };
  Bot.setProperty("connected_channels", channels, "json");
}

// Create Giveaway Object
var giveaway = {
  id: gid,
  channel: channel_target,
  channel_display: channel_target,
  title: title_input,
  prize: title_input,
  creator: user.telegramid,
  creator_id: user.telegramid,
  creator_name: user_full_name,
  created_at: new Date().toISOString(),
  status: "active",
  ended: false,
  users: {},
  participants: [],
  vote_counts: {},
  voted_users: {},
  vote_records: {},
  vote_messages: {}
};

all_giveaways[gid] = giveaway;
Bot.setProperty("all_giveaways", all_giveaways, "json");

var created_count = User.getProperty("giveaways_created", 0);
User.setProperty("giveaways_created", created_count + 1, "integer");

var my_list = User.getProperty("my_giveaway_ids", []);
my_list.push(gid);
User.setProperty("my_giveaway_ids", my_list, "json");

User.setProperty("temp_giveaway_channel", null, "string");

// 1. Notify OWNER
var owner_alert = 
  "📢 <b>NEW CONTEST CREATED ON BOT!</b>\n\n" +
  "🏆 <b>Prize / Title:</b> " + title_input + "\n" +
  "🆔 <b>Contest ID:</b> <code>" + gid + "</code>\n" +
  "📢 <b>Channel:</b> <code>" + channel_target + "</code>\n\n" +
  "👤 <b>Creator:</b> " + user_full_name + "\n" +
  "🆔 <b>Creator ID:</b> <code>" + user.telegramid + "</code>\n" +
  "📝 <b>Creator Username:</b> @" + (user.username || "None");

Api.sendMessage({
  chat_id: OWNER_ID,
  text: owner_alert,
  parse_mode: "HTML"
});

// 2. Automatically Post Announcement to the Channel
var join_url = "https://t.me/" + BOT_USERNAME + "?start=" + gid;

var channel_announcement = 
  "🎉 <b>NEW CONTEST STARTED!</b> 🎉\n\n" +
  "🏆 <b>Prize:</b> " + title_input + "\n\n" +
  "📌 <b>Contest ID:</b> <code>#" + gid + "</code>\n" +
  "👤 <b>Organized by:</b> " + user_full_name + "\n\n" +
  "✨ <i>Contest me participate karne ke liye neeche diye gaye button par click karein!</i>";

var channel_keyboard = [
  [
    { text: "🎯 Join Contest", url: join_url, style: "success" }
  ]
];

Api.sendMessage({
  chat_id: channel_target,
  text: channel_announcement,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: channel_keyboard },
  on_result: "on_channel_post_success",
  on_error: "on_channel_post_error"
});

// 3. Send Success Confirmation to User
var success_text = 
  "✅ <b>Contest Successfully Created!</b>\n\n" +
  "📌 <b>Contest ID:</b> <code>" + gid + "</code>\n" +
  "📢 <b>Channel:</b> <code>" + channel_target + "</code>\n" +
  "🏆 <b>Prize:</b> " + title_input + "\n\n" +
  "📢 <i>Contest announcement channel me automatically post kar di gayi hai!</i>\n\n" +
  "🔗 <b>Direct Join Link:</b>\n" +
  "<code>" + join_url + "</code>";

var buttons = [
  [{ text: "📊 My Contests", callback_data: "my_giveaways", style: "primary" }],
  [{ text: "🔙 Main Menu", callback_data: "/start", style: "primary" }]
];

var target_chat = (chat && chat.chatid) ? chat.chatid : user.telegramid;

Api.sendMessage({
  chat_id: target_chat,
  text: success_text,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: buttons }
});
