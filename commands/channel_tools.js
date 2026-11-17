/*CMD
  command: channel_tools
  help: Channel admin tools menu
  need_reply: false
CMD*/

var OWNER_ID = 8710308658;
if (user.telegramid != OWNER_ID) {
  Bot.sendMessage("🚫 <b>Access Denied:</b> Channel Control sirf Admin ke liye available hai.", { parse_mode: "HTML" });
  return;
}

var active_channel = User.getProperty("active_channel");

var text = 
  "🎛 <b>CHANNEL ADMIN CONTROL SUITE</b> 🎛\n\n" +
  "Is feature se aap bot ke channels ko manage kar sakte hain:\n\n" +
  "🔗 <b>Get Link:</b> Channel ka invite link generate karein\n" +
  "⬆️ <b>Promote:</b> Kisi user ko channel me Admin banayein\n" +
  "⬇️ <b>Demote:</b> Admin privileges remove karein\n" +
  "🗑 <b>Delete Message:</b> Channel ka koi bhi message delete karein\n\n";

var buttons = [];

if (active_channel) {
  text += "📌 <b>Current Active Channel:</b> <code>" + active_channel + "</code>\n\n";
  buttons.push([
    { text: "⚙️ Open Active Channel Panel", callback_data: "ch_panel", style: "success" }
  ]);
}

buttons.push([
  { text: "➕ Select / Change Channel", callback_data: "ch_select_prompt", style: "success" }
]);

buttons.push([
  { text: "🔙 Back to Admin", callback_data: "/admin", style: "primary" }
]);

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
