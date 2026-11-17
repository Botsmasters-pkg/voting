/*CMD
  command: how_it_works
  help: Guide on how the bot works exactly matching Python bot
  need_reply: false
CMD*/

if (request && request.callback_query) {
  Api.answerCallbackQuery({
    callback_query_id: request.callback_query.id
  });
}

var text = 
  "<b>📖 HOW THIS BOT WORKS</b>\n\n" +
  "<b>🎁 CREATE GIVEAWAY</b>\n" +
  "• Channel/group ka username ya ID do\n" +
  "• Bot admin hona chahiye us channel mein\n" +
  "• Unique link generate hoga\n\n" +
  "<b>🎯 JOIN GIVEAWAY</b>\n" +
  "• Link open karo → JOIN CHANNEL karo\n" +
  "• Phir JOIN GIVEAWAY dabao\n" +
  "• Tumhara profile channel mein post hoga\n\n" +
  "<b>🗳️ VOTE KAISE KAREIN</b>\n" +
  "• Channel mein participants ke naam pe Vote button hoga\n" +
  "• Kisi doosre participant ko vote do (khud ko nahi)\n" +
  "• 1 voter = 1 vote per giveaway\n\n" +
  "<b>⚠️ VOTE KAM KAB HOGA</b>\n" +
  "• Agar tum channel/group leave kar do\n" +
  "• Toh tumhara diya hua vote automatically minus ho jayega\n" +
  "• Isliye vote dene ke baad channel mein raho\n\n" +
  "<b>🏆 LEADERBOARD</b>\n" +
  "• Sabse zyada votes wala jeetega\n" +
  "• Real-time votes update hote hain\n\n" +
  "<i>Koi problem ho toh developer se contact karo.</i>";

var buttons = [
  [{ text: "🔙 BACK", callback_data: "go_back_home", style: "primary" }]
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
