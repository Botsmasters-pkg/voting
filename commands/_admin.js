/*CMD
  command: /admin
  help: Admin panel control dashboard with success and primary colored buttons
  need_reply: false
  aliases: admin
CMD*/

var OWNER_ID = 8710308658;
var uid = user.telegramid;

if (uid != OWNER_ID) {
  Bot.sendMessage("🚫 <b>Access Denied:</b> Aap is bot ke admin nahi hain.", { parse_mode: "HTML" });
  return;
}

// Ensure username is latest
Api.getMe({ on_result: "on_save_bot_info" });

var detected_uname = Bot.getProperty("bot_username", "TOXICVOTESBOT");

var text = 
  "⚡ <b>TOXIC VOTING BOT - ADMIN DASHBOARD</b> ⚡\n\n" +
  "Welcome back, <b>Admin (@codevexa)</b>!\n\n" +
  "🤖 <b>Current Active Bot:</b> @" + detected_uname + "\n" +
  "<i>Token ke anusaar Telegram bot username automatically sync rehta hai.</i>\n\n" +
  "Neeche diye gaye options se bot ko manage karein:";

var buttons = [
  [
    { text: "📊 Platform Stats", callback_data: "admin_stats", style: "primary" },
    { text: "📢 Broadcast", callback_data: "admin_broadcast", style: "success" }
  ],
  [
    { text: "🎛 Channel Control Suite", callback_data: "channel_tools", style: "success" }
  ],
  [
    { text: "🔄 Refresh Bot Info", callback_data: "cmd_detect_bot", style: "success" },
    { text: "🚫 Ban / Unban User", callback_data: "admin_ban", style: "primary" }
  ],
  [
    { text: "🔙 Exit Admin Panel", callback_data: "/start", style: "primary" }
  ]
];

var target_chat = (chat && chat.chatid) ? chat.chatid : user.telegramid;

if (request && request.callback_query && request.callback_query.message) {
  Api.editMessageText({
    chat_id: request.callback_query.message.chat.id,
    message_id: request.callback_query.message.message_id,
    text: text,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: buttons }
  });
} else {
  Api.sendMessage({
    chat_id: target_chat,
    text: text,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: buttons }
  });
}
