/*CMD
  command: step_fsub_link
  help: Step 2 of adding private or request force channel - process Link and finalize
  need_reply: true
CMD*/

var OWNER_ID = 8710308658;
if (user.telegramid != OWNER_ID) return;

var raw_msg = (options && options.text) ? options.text : message;

if (!raw_msg) {
  Bot.sendMessage("⚠️ Kripya valid Link bhejein.");
  Bot.runCommand("step_fsub_link");
  return;
}

var input = raw_msg.trim();

if (input === "/start" || input.toLowerCase() === "cancel") {
  User.setProperty("fsub_add_mode", null, "string");
  User.setProperty("fsub_temp_chat_id", null, "string");
  User.setProperty("waiting_fsub_chat_id", false, "boolean");
  User.setProperty("waiting_fsub_link", false, "boolean");
  Bot.runCommand("admin_fsub");
  return;
}

function getPropJson(name, default_val) {
  var val = Bot.getProperty(name);
  if (!val) return default_val;
  if (typeof val === "object") return val;
  if (typeof val === "string") {
    try { return JSON.parse(val) || default_val; } catch (e) { return default_val; }
  }
  return default_val;
}

var chat_id = User.getProperty("fsub_temp_chat_id");
var mode = User.getProperty("fsub_add_mode", "private");

// If invoked synchronously by step_fsub_chat_id in the same turn,
// input matches chat_id. Simply wait for user's actual link!
if (input === chat_id) {
  return;
}

User.setProperty("waiting_fsub_link", false, "boolean");

if (!chat_id) {
  Bot.sendMessage("⚠️ Chat ID session expire ho gaya. Kripya shuru se try karein.");
  Bot.runCommand("admin_fsub");
  return;
}

var link = input;
if (link.indexOf("t.me/") === -1 && link.indexOf("http") === -1) {
  Bot.sendMessage("⚠️ Invalid link! Kripya sahi Telegram invite link bhejein (Example: <code>https://t.me/+AbCdEf</code>).", { parse_mode: "HTML" });
  Bot.runCommand("step_fsub_link");
  return;
}

var channels = getPropJson("fsub_channels", []);

// Check duplicates
for (var i = 0; i < channels.length; i++) {
  if (channels[i].chat_id == chat_id) {
    Bot.sendMessage("⚠️ Yeh channel ID pehle se force sub me add hai.");
    Bot.runCommand("admin_fsub");
    return;
  }
}

var title = (mode === "request" ? "Request Channel (" : "Private Channel (") + chat_id + ")";

var new_ch = {
  chat_id: chat_id,
  link: link,
  title: title,
  type: mode,
  added_at: new Date().toISOString()
};

channels.push(new_ch);
Bot.setProperty("fsub_channels", channels, "json");

// Clear session
User.setProperty("fsub_add_mode", null, "string");
User.setProperty("fsub_temp_chat_id", null, "string");
User.setProperty("waiting_fsub_chat_id", false, "boolean");
User.setProperty("waiting_fsub_link", false, "boolean");

var success_badge = mode === "request" ? "🟡 REQUEST CHANNEL ADDED" : "🔒 PRIVATE CHANNEL ADDED";

var text = 
  "✅ <b>" + success_badge + "!</b>\n\n" +
  "🆔 <b>Chat ID:</b> <code>" + chat_id + "</code>\n" +
  "🔗 <b>Link:</b> " + link + "\n" +
  "📊 <b>Type:</b> <code>" + mode.toUpperCase() + "</code>\n\n" +
  (mode === "request" ? "✨ <i>Is channel me users ka pending join request turant verified consider hoga!</i>\n\n" : "") +
  "Ab sabhi naye users ko bot use karne se pehle yeh channel join karna zaroori hoga.";

var buttons = [
  [{ text: "🔙 F-Sub Dashboard", callback_data: "admin_fsub", style: "primary" }]
];

var target_chat = (chat && chat.chatid) ? chat.chatid : user.telegramid;
Api.sendMessage({
  chat_id: target_chat,
  text: text,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: buttons }
});
