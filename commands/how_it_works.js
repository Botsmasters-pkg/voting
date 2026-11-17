/*CMD
  command: how_it_works
  help: Explains bot usage guide
  need_reply: false
CMD*/

var text = 
  "ℹ️ <b>HOW TOXIC VOTING BOT WORKS:</b>\n\n" +
  "<b>1️⃣ Step 1: Bot ko Channel me Admin banayein</b>\n" +
  "• Bot ko apne Telegram Channel me add karein aur <i>Post Messages</i> & <i>Edit Messages</i> ki permission dein.\n\n" +
  "<b>2️⃣ Step 2: Contest Create karein</b>\n" +
  "• Bot me <b>CREATE</b> button dabayein.\n" +
  "• Channel username aur Contest ka Title/Prize enter karein.\n\n" +
  "<b>3️⃣ Step 3: Participants Join karenge</b>\n" +
  "• Channel me Contest announcement post ho jayegi.\n" +
  "• Users <b>🎯 Join Contest</b> par click karke participate karenge.\n\n" +
  "<b>4️⃣ Step 4: Voting Shuru!</b>\n" +
  "• Har participant ka voting card automatically channel me post ho jata hai.\n" +
  "• Voters <b>🗳 Vote</b> button daba kar vote karenge.\n" +
  "• Bot ensure karta hai ki ek user ek hi vote de sake!";

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
