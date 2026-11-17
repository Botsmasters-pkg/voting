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

var welcome_text = 
  "✨ <b>Welcome to Voting Contest Bot!</b> ✨\n\n" +
  "Hello <b>" + (user.first_name || "User") + "</b>!\n\n" +
  "Ye bot Telegram channels aur groups me <b>Voting Contests & Giveaways</b> organize karne ke liye banaya gaya hai.\n\n" +
  "🚀 <b>Features:</b>\n" +
  "• Live Vote Button with Counter\n" +
  "• Anti-Cheat & 1-Vote-Per-User Security\n" +
  "• Channel Force-Join Check\n" +
  "• Detailed User & Admin Stats\n\n" +
  "Neeche diye gaye buttons se shuru karein 👇";

var connect_url = BOT_USERNAME ? ("https://t.me/" + BOT_USERNAME + "?startchannel=true&admin=post_messages") : "https://t.me";

var buttons = [
  [
    { title: "➕ Create Contest", text: "➕ Create Contest", command: "create_giveaway", callback_data: "create_giveaway" },
    { title: "🎛 Channel Tools", text: "🎛 Channel Tools", command: "channel_tools", callback_data: "channel_tools" },
    { title: "📊 My Contests", text: "📊 My Contests", command: "my_giveaways", callback_data: "my_giveaways" }
  ],
  [
    { title: "📈 My Stats", text: "📈 My Stats", command: "my_stats", callback_data: "my_stats" },
    { title: "ℹ️ How It Works", text: "ℹ️ How It Works", command: "how_it_works", callback_data: "how_it_works" }
  ],
  [
    { title: "👨‍💻 Developer", text: "👨‍💻 Developer", url: "https://t.me/codevexa" }
  ],
  [
    { title: "🔗 Connect Channel (Admin)", text: "🔗 Connect Channel (Admin)", url: connect_url }
  ]
];

if (uid == OWNER_ID) {
  buttons.push([
    { title: "⚙️ Admin Panel", text: "⚙️ Admin Panel", command: "/admin", callback_data: "/admin" }
  ]);
}

Bot.sendInlineKeyboard(buttons, welcome_text, { parse_mode: "HTML" });
