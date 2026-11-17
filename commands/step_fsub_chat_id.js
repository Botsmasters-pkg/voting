/*CMD
  command: step_fsub_chat_id
  help: Step 1 of adding private or request force channel - process Chat ID input
  need_reply: true
CMD*/

var OWNER_ID = 8710308658;
if (user.telegramid != OWNER_ID) return;

if (!message) {
  Bot.sendMessage("⚠️ Kripya valid Chat ID bhejein (Example: <code>-1001234567890</code>).", { parse_mode: "HTML" });
  Bot.runCommand("step_fsub_chat_id");
  return;
}

var input = message.trim();

if (input === "/start" || input.toLowerCase() === "cancel") {
  User.setProperty("fsub_add_mode", null, "string");
  User.setProperty("fsub_temp_chat_id", null, "string");
  Bot.runCommand("admin_fsub");
  return;
}

// Basic validation for Chat ID
if (input.indexOf("t.me/") !== -1 || input.indexOf("http") !== -1) {
  Bot.sendMessage("⚠️ Yeh link hai! Pehle sirf <b>Chat ID</b> bhejein (Example: <code>-1001234567890</code>).\nLink agle step me manga jayega.", { parse_mode: "HTML" });
  Bot.runCommand("step_fsub_chat_id");
  return;
}

var chat_id = input;
User.setProperty("fsub_temp_chat_id", chat_id, "string");
User.setProperty("fsub_link_ready", false, "boolean");

var mode = User.getProperty("fsub_add_mode", "private");
var link_type_name = mode === "request" ? "Join Request Link" : "Invite Link";

var prompt_text = 
  "✅ <b>Chat ID Saved:</b> <code>" + chat_id + "</code>\n\n" +
  "🔗 <b>Step 2/2: Channel Link Bhejein</b>\n\n" +
  "Ab is channel ka <b>" + link_type_name + "</b> bhejein:\n\n" +
  "<i>Example:</i> <code>https://t.me/+AbCdEfGhIjKlMn</code>";

var buttons = [
  [{ text: "🔙 Cancel", callback_data: "admin_fsub", style: "primary" }]
];

var target_chat = (chat && chat.chatid) ? chat.chatid : user.telegramid;
Api.sendMessage({
  chat_id: target_chat,
  text: prompt_text,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: buttons }
});

Bot.runCommand("step_fsub_link");
