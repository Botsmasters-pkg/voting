/*CMD
  command: /admin
  help: Admin panel control dashboard
  need_reply: false
  aliases: admin
CMD*/

var OWNER_ID = 8710308658;
var uid = user.telegramid;

if (uid != OWNER_ID) {
  Bot.sendMessage("🚫 <b>Access Denied:</b> Aap is bot ke admin nahi hain.", { parse_mode: "HTML" });
  return;
}

var detected_uname = Bot.getProperty("bot_username", (bot && bot.name ? bot.name : "Detecting..."));

var text = 
  "⚡ <b>TOXIC VOTING BOT - ADMIN DASHBOARD</b> ⚡\n\n" +
  "Welcome back, <b>Admin (@codevexa)</b>!\n\n" +
  "🤖 <b>Current Active Bot:</b> @" + detected_uname + "\n" +
  "<i>Token badalne par bot ka naam automatically update ho jata hai.</i>\n\n" +
  "Neeche diye gaye options se bot ko manage karein:";

var buttons = [
  [
    { text: "📊 Platform Stats", callback_data: "admin_stats", style: "primary" },
    { text: "📢 Broadcast", callback_data: "admin_broadcast", style: "success" }
  ],
  [
    { text: "🔄 Refresh Bot Info", callback_data: "cmd_detect_bot", style: "success" },
    { text: "🚫 Ban / Unban User", callback_data: "admin_ban", style: "primary" }
  ],
  [
    { text: "🔙 Exit Admin Panel", callback_data: "/start", style: "primary" }
  ]
];

Bot.sendInlineKeyboard(buttons, text, { parse_mode: "HTML" });\n