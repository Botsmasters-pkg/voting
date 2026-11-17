/*CMD
  command: admin_ban
  help: Ask for User ID to ban or unban with primary cancel button
  need_reply: false
CMD*/

var OWNER_ID = 8710308658;
if (user.telegramid != OWNER_ID) {
  Bot.sendMessage("🚫 Access Denied.");
  return;
}

var banned_users = Bot.getProperty("banned_users", []);

var text = 
  "🚫 <b>USER BAN / UNBAN MANAGER</b>\n\n" +
  "Abhi total banned users: <code>" + banned_users.length + "</code>\n\n" +
  "User ka Telegram Numeric ID bhejo jisko Ban ya Unban karna hai.\n" +
  "<i>(Agar user pehle se banned hoga to Unban ho jayega, warna Ban ho jayega)</i>\n\n" +
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

User.setProperty("waiting_admin_ban", true, "boolean");
Bot.runCommand("step_admin_ban");
