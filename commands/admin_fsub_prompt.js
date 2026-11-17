/*CMD
  command: admin_fsub_prompt
  help: Prompt admin for public, private, or private request force channel
  need_reply: false
CMD*/

var OWNER_ID = 8710308658;
if (user.telegramid != OWNER_ID) return;

if (request && request.callback_query) {
  Api.answerCallbackQuery({
    callback_query_id: request.callback_query.id
  });
}

var mode = (params || "public").trim().toLowerCase();
User.setProperty("fsub_add_mode", mode, "string");

var text = "";
if (mode === "public") {
  text = 
    "🌐 <b>ADD PUBLIC FORCE CHANNEL</b> 🌐\n\n" +
    "Channel ka direct link ya <code>@username</code> bhejein:\n\n" +
    "<i>Example:</i> <code>https://t.me/MyChannel</code> ya <code>@MyChannel</code>\n\n" +
    "⚠️ <i>Bot ka is channel me Admin hona zaroori hai.</i>";
} else if (mode === "private") {
  text = 
    "🔒 <b>ADD PRIVATE FORCE CHANNEL</b> 🔒\n\n" +
    "Channel ka <b>Invite Link</b> aur <b>Chat ID</b> space dekar bhejein:\n\n" +
    "<i>Format:</i> <code>INVITE_LINK CHAT_ID</code>\n" +
    "<i>Example:</i> <code>https://t.me/+AbCdEfGh -1001234567890</code>\n\n" +
    "⚠️ <i>Bot ko channel me Admin banayein taaki bot membership verify kar sake.</i>";
} else if (mode === "request") {
  text = 
    "🟡 <b>ADD PRIVATE REQUEST CHANNEL (Join Request)</b> 🟡\n\n" +
    "Channel ka <b>Join Request Link</b> aur <b>Chat ID</b> space dekar bhejein:\n\n" +
    "<i>Format:</i> <code>REQUEST_LINK CHAT_ID</code>\n" +
    "<i>Example:</i> <code>https://t.me/+JoinReqLink -1001234567890</code>\n\n" +
    "✨ <b>Special Feature:</b> <i>Is channel me user ka request sirf pending bhi rahega to bhi turant <b>VERIFIED</b> mana jayega (Admin ke approval ka wait nahi karna hoga)!</i>";
}

var buttons = [
  [{ text: "🔙 Cancel", callback_data: "admin_fsub", style: "primary" }]
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

Bot.runCommand("step_fsub_add");
