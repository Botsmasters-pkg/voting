/*CMD
  command: step_fsub_link
  help: Step 2 of adding private or request force channel - process Link and finalize
  need_reply: true
CMD*/

var OWNER_ID = 8710308658;
if (user.telegramid != OWNER_ID) return;

if (!message) {
  Bot.sendMessage("⚠️ Kripya valid Link bhejein.");
  Bot.runCommand("step_fsub_link");
  return;
}

var input = message.trim();

if (input === "/start" || input.toLowerCase() === "cancel") {
  User.setProperty("fsub_add_mode", null, "string");
  User.setProperty("fsub_temp_chat_id", null, "string");
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

var fsub_channels = getPropJson("fsub_channels", []);

// Check if already added
var exists = false;
for (var i = 0; i < fsub_channels.length; i++) {
  if (fsub_channels[i].chat_id === chat_id || fsub_channels[i].link === link) {
    exists = true;
    break;
  }
}

if (exists) {
  Bot.sendMessage("⚠️ Yeh channel ya link pehle se hi Force Sub list me shamil hai!");
  User.setProperty("fsub_add_mode", null, "string");
  User.setProperty("fsub_temp_chat_id", null, "string");
  Bot.runCommand("admin_fsub");
  return;
}

var title = (mode === "request" ? "Request Channel" : "Private Channel") + " (" + chat_id + ")";

var new_ch = {
  id: chat_id,
  title: title,
  link: link,
  chat_id: chat_id,
  type: mode,
  added_at: new Date().toISOString()
};

fsub_channels.push(new_ch);
Bot.setProperty("fsub_channels", fsub_channels, "json");

User.setProperty("fsub_add_mode", null, "string");
User.setProperty("fsub_temp_chat_id", null, "string");

var conf_text = 
  "✅ <b>FORCE CHANNEL ADDED SUCCESSFULLY!</b> ✅\n\n" +
  "📌 <b>Type:</b> <code>" + mode.toUpperCase() + " CHANNEL</code>\n" +
  "📢 <b>Title:</b> " + title + "\n" +
  "🆔 <b>Chat ID:</b> <code>" + chat_id + "</code>\n" +
  "🔗 <b>Link:</b> " + link + "\n\n" +
  (mode === "request" ? "✨ <i>Is channel me user ka join request pending rahega to bhi turant verified mana jayega!</i>\n\n" : "") +
  "<i>Ab sabhi users ko bot access karne se pehle ise 3x3 JOIN button grid me join karna hoga.</i>";

var buttons = [
  [{ text: "📋 View Channel List", callback_data: "admin_fsub_list", style: "primary" }],
  [{ text: "🔙 Back to F-Sub Channels", callback_data: "admin_fsub", style: "primary" }]
];

var target_chat = (chat && chat.chatid) ? chat.chatid : user.telegramid;
Api.sendMessage({
  chat_id: target_chat,
  text: conf_text,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: buttons }
});
