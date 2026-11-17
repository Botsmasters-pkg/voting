/*CMD
  command: admin_broadcast
  help: Ask for broadcast message text with primary cancel button
  need_reply: false
CMD*/

var OWNER_ID = 8710308658;
if (user.telegramid != OWNER_ID) {
  Bot.sendMessage("🚫 Access Denied.");
  return;
}

var text = 
  "📢 <b>ADMIN BROADCAST</b>\n\n" +
  "Sabhi users ko bhejne ke liye message type karein.\n\n" +
  "<i>(HTML tags jaise <b>bold</b>, <i>italic</i>, <code>code</code> supported hain)</i>\n\n" +
  "Cancel karne ke liye neeche button dabayein ya <code>cancel</code> type karein.";

var buttons = [
  [{ text: "🔙 Cancel", callback_data: "/admin", style: "primary" }]
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

User.setProperty("waiting_admin_broadcast", true, "boolean");
Bot.runCommand("step_admin_broadcast");
