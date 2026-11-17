/*CMD
  command: ch_select_prompt
  help: Ask user for channel username or ID with primary styled cancel button
  need_reply: false
CMD*/

var text = 
  "📢 <b>Channel Setup</b>\n\n" +
  "Apne Telegram Channel ka username ya ID bhejo:\n\n" +
  "<i>Example:</i> <code>@MyChannel</code> ya <code>-1001234567890</code>\n\n" +
  "⚠️ <b>Note:</b> Bot ko channel me pehle <b>Admin</b> banana zaroori hai (with Add Admin, Delete Messages & Invite Links permissions).";

var buttons = [
  [{ text: "🔙 Cancel", callback_data: "channel_tools", style: "primary" }]
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

Bot.runCommand("step_ch_select");
