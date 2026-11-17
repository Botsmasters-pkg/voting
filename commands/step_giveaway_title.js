/*CMD
  command: step_giveaway_title
  help: Process contest title, notify owner, and publish with dynamic bot username
  need_reply: true
CMD*/

if (!message) {
  Bot.sendMessage("⚠️ Kripya contest ka title enter karein.");
  Bot.runCommand("step_giveaway_title");
  return;
}

if (message === "/start" || message.toLowerCase() === "cancel") {
  Bot.runCommand("/start");
  return;
}

var channel_target = User.getProperty("temp_giveaway_channel");
if (!channel_target) {
  Bot.sendMessage("⚠️ Koi channel select nahi mila. Shuru se shuru karein.");
  Bot.runCommand("/start");
  return;
}

var title_input = message.trim();
var gid = "G" + (new Date().getTime());
var OWNER_ID = 8710308658;

// Accurate Bot Username: Fallback to TOXICVOTESBOT and read cached Telegram username
var BOT_USERNAME = Bot.getProperty("bot_username", "TOXICVOTESBOT");

// Create Giveaway Object
var giveaway = {
  id: gid,
  channel: channel_target,
  title: title_input,
  creator_id: user.telegramid,
  creator_name: user.first_name || "User",
  created_at: new Date().toISOString(),
  status: "active",
  participants: [],
  vote_counts: {},
  voted_users: {}
};

var all_giveaways = Bot.getProperty("all_giveaways", {});
all_giveaways[gid] = giveaway;
Bot.setProperty("all_giveaways", all_giveaways, "json");

var created_count = User.getProperty("giveaways_created", 0);
User.setProperty("giveaways_created", created_count + 1, "integer");

var my_list = User.getProperty("my_giveaway_ids", []);
my_list.push(gid);
User.setProperty("my_giveaway_ids", my_list, "json");

User.setProperty("temp_giveaway_channel", null, "string");

// Notify OWNER
var owner_alert = 
  "📢 <b>NEW CONTEST CREATED ON BOT!</b>\n\n" +
  "🏆 <b>Title:</b> " + title_input + "\n" +
  "🆔 <b>Contest ID:</b> <code>" + gid + "</code>\n" +
  "📢 <b>Channel:</b> <code>" + channel_target + "</code>\n\n" +
  "👤 <b>Creator:</b> " + (user.first_name || "User") + "\n" +
  "🆔 <b>Creator ID:</b> <code>" + user.telegramid + "</code>\n" +
  "📝 <b>Creator Username:</b> @" + (user.username || "None");

Api.sendMessage({
  chat_id: OWNER_ID,
  text: owner_alert,
  parse_mode: "HTML"
});

// Send Announcement to Channel
var channel_announcement = 
  "🎉 <b>NEW CONTEST STARTED!</b> 🎉\n\n" +
  "🏆 <b>Title:</b> " + title_input + "\n\n" +
  "📌 <b>Contest ID:</b> <code>#" + gid + "</code>\n" +
  "👤 <b>Organized by:</b> " + (user.first_name || "Admin") + "\n\n" +
  "✨ <i>Contest me participate karne ke liye neeche diye gaye button par click karein!</i>";

var join_url = "https://t.me/" + BOT_USERNAME + "?start=join_" + gid;

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

var success_text = 
  "✅ <b>Contest Successfully Created!</b>\n\n" +
  "📌 <b>Contest ID:</b> <code>" + gid + "</code>\n" +
  "📢 <b>Channel:</b> <code>" + channel_target + "</code>\n" +
  "🏆 <b>Title:</b> " + title_input + "\n\n" +
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
