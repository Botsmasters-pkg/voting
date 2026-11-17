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
  [{ text: "CREATE", callback_data: "create_giveaway", style: "success" }],
  [{ text: "🔙 Main Menu", callback_data: "/start", style: "primary" }]
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
