/*CMD
  command: my_stats
  help: Show user statistics
  need_reply: false
CMD*/

var votes_given = User.getProperty("votes_given", 0);
var giveaways_joined = User.getProperty("giveaways_joined", 0);
var giveaways_created = User.getProperty("giveaways_created", 0);

var text = 
  "📈 <b>YOUR ACCOUNT STATISTICS</b> 📈\n\n" +
  "👤 <b>Name:</b> " + (user.first_name || "User") + "\n" +
  "🆔 <b>User ID:</b> <code>" + user.telegramid + "</code>\n" +
  "📝 <b>Username:</b> " + (user.username ? ("@" + user.username) : "None") + "\n\n" +
  "━━━━━━━━━━━━━━━━━━━\n" +
  "🗳 <b>Total Votes Given:</b> <code>" + votes_given + "</code>\n" +
  "🎯 <b>Contests Joined:</b> <code>" + giveaways_joined + "</code>\n" +
  "🏆 <b>Contests Created:</b> <code>" + giveaways_created + "</code>\n" +
  "━━━━━━━━━━━━━━━━━━━\n\n" +
  "<i>Keep participating to rank higher!</i>";

var buttons = [
  [{ title: "➕ Create Contest", text: "➕ Create Contest", command: "create_giveaway", callback_data: "create_giveaway", style: "success" }],
  [{ title: "🔙 Main Menu", text: "🔙 Main Menu", command: "/start", callback_data: "/start", style: "primary" }]
];

Bot.sendInlineKeyboard(buttons, text, { parse_mode: "HTML" });
