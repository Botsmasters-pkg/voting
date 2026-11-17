/*CMD
  command: admin_stats
  help: View overall bot statistics in admin panel
  need_reply: false
CMD*/

var OWNER_ID = 8710308658;
if (user.telegramid != OWNER_ID) {
  Bot.sendMessage("🚫 Access Denied.");
  return;
}

var all_users = Bot.getProperty("all_users", []);
var all_giveaways = Bot.getProperty("all_giveaways", {});
var total_votes_all = Bot.getProperty("total_votes_count", 0);
var banned_users = Bot.getProperty("banned_users", []);
var detected_uname = Bot.getProperty("bot_username", (bot && bot.name ? bot.name : "Auto"));

var contests_count = 0;
var active_contests = 0;
for (var k in all_giveaways) {
  contests_count++;
  if (all_giveaways[k].status === "active") {
    active_contests++;
  }
}

var text = 
  "📊 <b>OVERALL PLATFORM STATISTICS</b> 📊\n\n" +
  "🤖 <b>Bot Username:</b> @" + detected_uname + "\n" +
  "👥 <b>Total Registered Users:</b> <code>" + all_users.length + "</code>\n" +
  "🏆 <b>Total Contests Created:</b> <code>" + contests_count + "</code>\n" +
  "🟢 <b>Active Contests:</b> <code>" + active_contests + "</code>\n" +
  "🗳 <b>Total Votes Cast:</b> <code>" + total_votes_all + "</code>\n" +
  "🚫 <b>Banned Users:</b> <code>" + banned_users.length + "</code>\n\n" +
  "<i>Last refreshed: " + new Date().toLocaleString() + "</i>";

var buttons = [
  [{ text: "🔄 Refresh", callback_data: "admin_stats", style: "success" }],
  [{ text: "🔙 Admin Panel", callback_data: "/admin", style: "primary" }]
];

Bot.sendInlineKeyboard(buttons, text, { parse_mode: "HTML" });\n