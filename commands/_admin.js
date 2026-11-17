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
    { title: "📊 Platform Stats", text: "📊 Platform Stats", command: "admin_stats", callback_data: "admin_stats", style: "primary" },
    { title: "📢 Broadcast", text: "📢 Broadcast", command: "admin_broadcast", callback_data: "admin_broadcast", style: "success" }
  ],
  [
    { title: "🎛 Channel Control Suite", text: "🎛 Channel Control Suite", command: "channel_tools", callback_data: "channel_tools", style: "success" }
  ],
  [
    { title: "🔄 Refresh Bot Info", text: "🔄 Refresh Bot Info", command: "cmd_detect_bot", callback_data: "cmd_detect_bot", style: "success" },
    { title: "🚫 Ban / Unban User", text: "🚫 Ban / Unban User", command: "admin_ban", callback_data: "admin_ban", style: "primary" }
  ],
  [
    { title: "🔙 Exit Admin Panel", text: "🔙 Exit Admin Panel", command: "/start", callback_data: "/start", style: "primary" }
  ]
];

Bot.sendInlineKeyboard(buttons, text, { parse_mode: "HTML" });
