/*CMD
  command: /start
  help: Start the bot & show main menu with colored primary and success buttons
  need_reply: false
  aliases: 
CMD*/

// ===== CONFIG =====
var OWNER_ID = 8710308658;

// Accurate Bot Username: Fallback to TOXICVOTESBOT and read cached Telegram username
var BOT_USERNAME = Bot.getProperty("bot_username", "TOXICVOTESBOT");

// Always refresh bot username via getMe
Api.getMe({ on_result: "on_save_bot_info" });

var all_users = Bot.getProperty("all_users", []);
var uid = user.telegramid;
if (all_users.indexOf(uid) === -1) {
  all_users.push(uid);
  Bot.setProperty("all_users", all_users, "json");
  
  User.setProperty("votes_given", 0, "integer");
  User.setProperty("votes_received", 0, "integer");
  User.setProperty("giveaways_joined", 0, "integer");
  User.setProperty("giveaways_created", 0, "integer");
}

if (params) {
  if (params.indexOf("join_") === 0) {
    var gid = params.replace("join_", "");
    Bot.run({
      command: "join_giveaway",
      options: { giveaway_id: gid }
    });
    return;
  }
}

var welcome_text = 
  "✨ <b>WELCOME TO TOXIC VOTE GIVEAWAY BOT</b> ✨\n\n" +
  "<i>☄️ Create Powerful Vote Giveaways</i>\n" +
  "<i>🔜 Real Time Vote System</i>\n" +
  "<i>📈 Advanced Management Tools</i>\n" +
  "<i>❤️‍🔥 Leaderboard & Analytics</i>\n\n" +
  "<b>🚀 START CREATING NOW!</b>";

var connect_url = "https://t.me/" + BOT_USERNAME + "?startchannel=true&admin=post_messages";

var buttons = [
  [
    { text: "CONNECT", url: connect_url, style: "success" }
  ],
  [
    { text: "CREATE", callback_data: "create_giveaway", style: "primary" },
    { text: "MANAGE", callback_data: "my_giveaways", style: "primary" }
  ],
  [
    { text: "MY STATS", callback_data: "my_stats", style: "primary" },
    { text: "HOW IT WORKS", callback_data: "how_it_works", style: "primary" }
  ],
  [
    { text: "👨‍💻 Developer", url: "https://t.me/codevexa", style: "success" }
  ]
];

if (uid == OWNER_ID) {
  buttons.push([
    { text: "⚙️ ADMIN PANEL", callback_data: "/admin", style: "primary" }
  ]);
}

var target_chat = (chat && chat.chatid) ? chat.chatid : user.telegramid;

// Direct Telegram API call to render vibrant success (green) & primary (blue) buttons
if (request && request.callback_query && request.callback_query.message) {
  Api.editMessageText({
    chat_id: request.callback_query.message.chat.id,
    message_id: request.callback_query.message.message_id,
    text: welcome_text,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: buttons }
  });
} else {
  Api.sendMessage({
    chat_id: target_chat,
    text: welcome_text,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: buttons }
  });
}
