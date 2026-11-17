/*CMD
  command: step_fsub_add
  help: Process adding public, private, or private request force sub channel
  need_reply: true
CMD*/

var OWNER_ID = 8710308658;
if (user.telegramid != OWNER_ID) return;

if (!message) {
  Bot.sendMessage("⚠️ Kripya valid input bhejein.");
  Bot.runCommand("step_fsub_add");
  return;
}

if (message === "/start" || message.toLowerCase() === "cancel") {
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

var mode = User.getProperty("fsub_add_mode", "public");
var input = message.trim();

var link = "";
var chat_id = "";
var title = "";

if (mode === "public") {
  var uname = input;
  if (uname.indexOf("t.me/") !== -1) {
    uname = uname.substring(uname.indexOf("t.me/") + 5);
  }
  if (uname.indexOf("/") !== -1) {
    uname = uname.split("/")[0];
  }
  uname = uname.replace("@", "").trim();
  
  if (!uname) {
    Bot.sendMessage("⚠️ Invalid Public Channel link ya username. Kripya sahi format bhejein.");
    Bot.runCommand("step_fsub_add");
    return;
  }
  
  link = "https://t.me/" + uname;
  chat_id = "@" + uname;
  title = "@" + uname;
} else {
  // Private or Request channel (LINK CHAT_ID)
  var parts = input.split(/\s+/);
  if (parts.length < 2) {
    Bot.sendMessage("⚠️ Format galat hai! Link aur Chat ID space dekar bhejein.\n<i>Example:</i> <code>https://t.me/+AbCdEf -1001234567890</code>", { parse_mode: "HTML" });
    Bot.runCommand("step_fsub_add");
    return;
  }
  
  link = parts[0].trim();
  chat_id = parts[1].trim();
  title = (mode === "request" ? "Request Channel" : "Private Channel") + " (" + chat_id + ")";
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
  Bot.sendMessage("⚠️ Ye channel pehle se hi Force Sub list me shamil hai!");
  Bot.runCommand("admin_fsub");
  return;
}

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

var conf_text = 
  "✅ <b>FORCE CHANNEL ADDED SUCCESSFULLY!</b> ✅\n\n" +
  "📌 <b>Type:</b> <code>" + mode.toUpperCase() + "</code>\n" +
  "📢 <b>Title:</b> " + title + "\n" +
  "🆔 <b>Chat ID:</b> <code>" + chat_id + "</code>\n" +
  "🔗 <b>Link:</b> " + link + "\n\n" +
  "<i>Ab sabhi users ko bot access karne se pehle ise 3x3 JOIN button grid me join karna hoga.</i>";

var buttons = [
  [{ text: "🔙 Back to F-Sub Channels", callback_data: "admin_fsub", style: "primary" }]
];

var target_chat = (chat && chat.chatid) ? chat.chatid : user.telegramid;
Api.sendMessage({
  chat_id: target_chat,
  text: conf_text,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: buttons }
});
