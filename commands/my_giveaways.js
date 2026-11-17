/*CMD
  command: my_giveaways
  help: List user created contests with primary styled buttons
  need_reply: false
CMD*/

var my_list = User.getProperty("my_giveaway_ids", []);
var all_giveaways = Bot.getProperty("all_giveaways", {});
var target_chat = (chat && chat.chatid) ? chat.chatid : user.telegramid;

if (!my_list || my_list.length === 0) {
  var empty_text = 
    "📊 <b>My Contests</b>\n\n" +
    "Aapne abhi tak koi bhi Contest create nahi kiya hai.\n\n" +
    "Naya contest shuru karne ke liye neeche button dabayein!";
  
  var empty_buttons = [
    [{ text: "➕ Create Contest", callback_data: "create_giveaway", style: "success" }],
    [{ text: "🔙 Main Menu", callback_data: "/start", style: "primary" }]
  ];
  
  if (request && request.callback_query && request.callback_query.message) {
    Api.editMessageText({
      chat_id: request.callback_query.message.chat.id,
      message_id: request.callback_query.message.message_id,
      text: empty_text,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: empty_buttons }
    });
  } else {
    Api.sendMessage({
      chat_id: target_chat,
      text: empty_text,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: empty_buttons }
    });
  }
  return;
}

var text = "📊 <b>Your Created Contests:</b>\n\n";

for (var i = 0; i < my_list.length; i++) {
  var gid = my_list[i];
  var g = all_giveaways[gid];
  if (g) {
    var p_count = g.participants ? g.participants.length : 0;
    var total_v = 0;
    if (g.vote_counts) {
      for (var k in g.vote_counts) {
        total_v += g.vote_counts[k];
      }
    }
    text += "🔹 <b>" + g.title + "</b>\n" +
            "   • ID: <code>" + gid + "</code>\n" +
            "   • Status: <b>" + (g.status || "active").toUpperCase() + "</b>\n" +
            "   • Channel: <code>" + g.channel + "</code>\n" +
            "   • Participants: <b>" + p_count + "</b>\n" +
            "   • Total Votes: <b>" + total_v + "</b>\n\n";
  }
}

var buttons = [
  [{ text: "➕ Create Another", callback_data: "create_giveaway", style: "success" }],
  [{ text: "🔙 Main Menu", callback_data: "/start", style: "primary" }]
];

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
