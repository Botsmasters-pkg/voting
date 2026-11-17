/*CMD
  command: admin_fsub_prompt
  help: Prompt admin for public channel, or initiate 2-step Chat ID then Link for private/request channels
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
var next_command = "";

if (mode === "public") {
  text = 
    "🌐 <b>ADD PUBLIC FORCE CHANNEL</b> 🌐\n\n" +
    "Channel ka direct link ya <code>@username</code> bhejein:\n\n" +
    "<i>Example:</i> <code>https://t.me/MyChannel</code> ya <code>@MyChannel</code>\n\n" +
    "⚠️ <i>Bot ka is channel me Admin hona zaroori hai.</i>";
  next_command = "step_fsub_add";
} else if (mode === "private") {
  User.setProperty("waiting_fsub_chat_id", true, "boolean");
  User.setProperty("waiting_fsub_link", false, "boolean");
  text = 
    "🔒 <b>ADD PRIVATE FORCE CHANNEL (Step 1/2)</b> 🔒\n\n" +
    "Pehle channel ka <b>Chat ID</b> bhejein:\n\n" +
    "<i>Example:</i> <code>-1001234567890</code>\n\n" +
    "⚠️ <i>Chat ID aane ke baad bot aapse channel ka Invite Link mangega.</i>";
  next_command = "step_fsub_chat_id";
} else if (mode === "request") {
  User.setProperty("waiting_fsub_chat_id", true, "boolean");
  User.setProperty("waiting_fsub_link", false, "boolean");
  text = 
    "🟡 <b>ADD REQUEST CHANNEL (Step 1/2)</b> 🟡\n\n" +
    "Pehle channel ka <b>Chat ID</b> bhejein:\n\n" +
    "<i>Example:</i> <code>-1001234567890</code>\n\n" +
    "✨ <b>Special Feature:</b> <i>Is channel me user ka join request pending rahega to bhi turant <b>VERIFIED</b> mana jayega!</i>\n" +
    "⚠️ <i>Chat ID aane ke baad bot aapse Join Request Link mangega.</i>";
  next_command = "step_fsub_chat_id";
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

Bot.runCommand(next_command);
