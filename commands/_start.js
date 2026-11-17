/*CMD
  command: /start
  help: Start the bot & show main menu with auto-detected bot username
  need_reply: false
  aliases: 
CMD*/

// ===== CONFIG =====
var OWNER_ID = 8710308658;

// Dynamic Bot Username (Automatic detect token se)
var cached_uname = Bot.getProperty("bot_username");
var BOT_USERNAME = (bot && bot.name) ? bot.name.replace("@", "") : (cached_uname || "");

// Agar cache me nahi hai to Telegram API se automatically fetch karein
if (!cached_uname) {
  Api.getMe({ on_result: "on_save_bot_info" });
}

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

// Exactly like original Python bot welcome text
var welcome_text = 
  "✨ <b>WELCOME TO TOXIC VOTE GIVEAWAY BOT</b> ✨\n\n" +
  "<i>☄️ Create Powerful Vote Giveaways</i>\n" +
  "<i>🔜 Real Time Vote System</i>\n" +
  "<i>📈 Advanced Management Tools</i>\n" +
  "<i>❤️‍🔥 Leaderboard & Analytics</i>\n\n" +
  "<b>🚀 START CREATING NOW!</b>";

var connect_url = BOT_USERNAME ? ("https://t.me/" + BOT_USERNAME + "?startchannel=true&admin=post_messages") : "https://t.me";

// Exactly like original Python bot user menu
var buttons = [
  [
    { title: "CONNECT", text: "CONNECT", url: connect_url, style: "success" }
  ],
  [
    { title: "CREATE", text: "CREATE", command: "create_giveaway", callback_data: "create_giveaway", style: "success" },
    { title: "MANAGE", text: "MANAGE", command: "my_giveaways", callback_data: "my_giveaways", style: "primary" }
  ],
  [
    { title: "MY STATS", text: "MY STATS", command: "my_stats", callback_data: "my_stats", style: "primary" },
    { title: "HOW IT WORKS", text: "HOW IT WORKS", command: "how_it_works", callback_data: "how_it_works", style: "primary" }
  ],
  [
    { title: "👨‍💻 Developer", text: "👨‍💻 Developer", url: "https://t.me/codevexa", style: "success" }
  ]
];

if (uid == OWNER_ID) {
  buttons.push([
    { title: "⚙️ ADMIN PANEL", text: "⚙️ ADMIN PANEL", command: "/admin", callback_data: "/admin", style: "primary" }
  ]);
}

Bot.sendInlineKeyboard(buttons, welcome_text, { parse_mode: "HTML" });
