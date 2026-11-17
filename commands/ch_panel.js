/*CMD
  command: ch_panel
  help: Display Channel Management Control Panel
  need_reply: false
CMD*/

var OWNER_ID = 8710308658;
if (user.telegramid != OWNER_ID) {
  Bot.sendMessage("🚫 <b>Access Denied:</b> Sirf Admin access kar sakta hai.", { parse_mode: "HTML" });
  return;
}

var active_channel = User.getProperty("active_channel");

if (!active_channel) {
  Bot.runCommand("ch_select_prompt");
  return;
}

var text = 
  "🎛 <b>CHANNEL CONTROL PANEL</b> 🎛\n\n" +
  "📢 <b>Channel:</b> <code>" + active_channel + "</code>\n\n" +
  "Neeche diye gaye buttons se feature select karein 👇";

var buttons = [
  [
    { text: "🔗 Get Channel Link", callback_data: "ch_get_link", style: "success" }
  ],
  [
    { text: "⬆️ Promote User", callback_data: "ch_promote", style: "success" },
    { text: "⬇️ Demote User", callback_data: "ch_demote", style: "primary" }
  ],
  [
    { text: "🗑 Delete Message", callback_data: "ch_delete_msg", style: "primary" }
  ],
  [
    { text: "🔄 Switch Channel", callback_data: "ch_select_prompt", style: "primary" },
    { text: "🔙 Back to Admin", callback_data: "/admin", style: "primary" }
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
