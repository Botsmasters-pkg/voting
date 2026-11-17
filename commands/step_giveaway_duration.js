/*CMD
  command: step_giveaway_duration
  help: Process contest duration selection, schedule auto-end timer, post to channel, and finalize contest
  need_reply: false
CMD*/

if (request && request.callback_query) {
  Api.answerCallbackQuery({
    callback_query_id: request.callback_query.id
  });
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
var title_input = User.getProperty("temp_giveaway_title");

if (!channel_target || !title_input) {
  Bot.sendMessage("⚠️ Contest details nahi mili. Shuru se shuru karein.");
  Bot.runCommand("/start");
  return;
}

var raw_dur = (params || "").trim().toLowerCase();
var duration_sec = 0;
var duration_label = "No Timer (Manual End)";

if (raw_dur === "1h") {
  duration_sec = 3600;
  duration_label = "1 Hour";
} else if (raw_dur === "6h") {
  duration_sec = 6 * 3600;
  duration_label = "6 Hours";
} else if (raw_dur === "12h") {
  duration_sec = 12 * 3600;
  duration_label = "12 Hours";
} else if (raw_dur === "24h") {
  duration_sec = 24 * 3600;
  duration_label = "24 Hours (1 Day)";
} else if (raw_dur === "72h") {
  duration_sec = 72 * 3600;
  duration_label = "3 Days";
}

var deadline_iso = null;
var deadline_text = "None";
if (duration_sec > 0) {
  var deadline_date = new Date(Date.now() + duration_sec * 1000);
  deadline_iso = deadline_date.toISOString();
  deadline_text = deadline_date.toLocaleString();
}

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
var all_giveaways = getPropJson("all_giveaways", {});
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
  duration_seconds: duration_sec,
  duration_label: duration_label,
  deadline_at: deadline_iso,
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

// Schedule Auto-End Timer via Bots.Business Scheduler
if (duration_sec > 0) {
  Bot.run({
    command: "cmd_auto_end_giveaway",
    run_after: duration_sec,
    options: { giveaway_id: gid }
  });
}

var created_count = User.getProperty("giveaways_created", 0);
User.setProperty("giveaways_created", created_count + 1, "integer");

var my_list = User.getProperty("my_giveaway_ids", []);
my_list.push(gid);
User.setProperty("my_giveaway_ids", my_list, "json");

// Clean temporary session keys
User.setProperty("temp_giveaway_channel", null, "string");
User.setProperty("temp_giveaway_title", null, "string");

// 1. Notify OWNER
var owner_alert = 
  "📢 <b>NEW CONTEST CREATED ON BOT!</b>\n\n" +
  "🏆 <b>Prize / Title:</b> " + title_input + "\n" +
  "🆔 <b>Contest ID:</b> <code>" + gid + "</code>\n" +
  "📢 <b>Channel:</b> <code>" + channel_target + "</code>\n" +
  "⏱ <b>Timer:</b> " + duration_label + "\n" +
  "⏳ <b>Deadline:</b> " + deadline_text + "\n\n" +
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
  "🏆 <b>Prize:</b> " + title_input + "\n" +
  "📌 <b>Contest ID:</b> <code>#" + gid + "</code>\n" +
  "⏱ <b>Duration:</b> <b>" + duration_label + "</b>\n" +
  (duration_sec > 0 ? ("⏳ <b>Ends at:</b> <code>" + deadline_text + "</code>\n") : "") +
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
  "🏆 <b>Prize:</b> " + title_input + "\n" +
  "⏱ <b>Duration:</b> " + duration_label + "\n" +
  (duration_sec > 0 ? ("⏳ <b>Auto-Ends at:</b> " + deadline_text + "\n\n") : "\n") +
  "📢 <i>Contest announcement channel me automatically post ho gayi hai!</i>\n\n" +
  "🔗 <b>Direct Join Link:</b>\n" +
  "<code>" + join_url + "</code>";

var buttons = [
  [{ text: "📊 My Contests", callback_data: "my_giveaways", style: "primary" }],
  [{ text: "🔙 Main Menu", callback_data: "/start", style: "primary" }]
];

var target_chat = (chat && chat.chatid) ? chat.chatid : user.telegramid;

if (request && request.callback_query && request.callback_query.message) {
  Api.editMessageText({
    chat_id: request.callback_query.message.chat.id,
    message_id: request.callback_query.message.message_id,
    text: success_text,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: buttons }
  });
} else {
  Api.sendMessage({
    chat_id: target_chat,
    text: success_text,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: buttons }
  });
}
