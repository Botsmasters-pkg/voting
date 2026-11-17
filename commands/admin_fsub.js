/*CMD
  command: admin_fsub
  help: Admin Force Sub (F-Sub) Channels Manager: add public, private, and private request channels with 3x3 grid
  need_reply: false
CMD*/

var OWNER_ID = 8710308658;
var uid = user.telegramid;

if (request && request.callback_query) {
  Api.answerCallbackQuery({
    callback_query_id: request.callback_query.id
  });
}

if (uid != OWNER_ID) {
  Bot.sendMessage("🚫 <b>Access Denied:</b> Sirf Bot Admin ke liye available hai.", { parse_mode: "HTML" });
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

var fsub_channels = getPropJson("fsub_channels", []);
var fsub_enabled = Bot.getProperty("fsub_enabled");
if (fsub_enabled === null || fsub_enabled === undefined) {
  fsub_enabled = true;
  Bot.setProperty("fsub_enabled", true, "boolean");
}

var status_str = fsub_enabled ? "🟢 ENABLED (Active)" : "🔴 DISABLED (Off)";

var text = 
  "📢 <b>FORCE SUB (F-SUB) CHANNELS CONTROL</b> 📢\n\n" +
  "<b>Status:</b> <b>" + status_str + "</b>\n" +
  "<b>Total Channels:</b> <code>" + fsub_channels.length + "</code>\n\n" +
  "━━━━━━━━━━━━━━━━━━━━━━\n";

if (fsub_channels.length === 0) {
  text += "⚠️ <i>Abhi koi bhi Force Sub channel add nahi hai.</i>\n";
} else {
  for (var i = 0; i < fsub_channels.length; i++) {
    var ch = fsub_channels[i];
    var type_badge = ch.type === "request" ? "🟡 [REQUEST]" : (ch.type === "private" ? "🔒 [PRIVATE]" : "🌐 [PUBLIC]");
    text += "<b>" + (i + 1) + ".</b> " + type_badge + " <b>" + ch.title + "</b>\n" +
            "   🆔 <code>" + ch.chat_id + "</code>\n" +
            "   🔗 " + ch.link + "\n\n";
  }
}

text += "━━━━━━━━━━━━━━━━━━━━━━\n" +
        "<i>Users ko bot use karne se pehle in channels ko 3x3 JOIN grid me join karna zaroori hoga.</i>";

var toggle_label = fsub_enabled ? "🔴 Turn F-Sub OFF" : "🟢 Turn F-Sub ON";

var buttons = [
  [
    { text: "📋 Channel List (" + fsub_channels.length + ")", callback_data: "admin_fsub_list", style: "primary" },
    { text: toggle_label, callback_data: "admin_fsub_toggle", style: fsub_enabled ? "danger" : "success" }
  ],
  [
    { text: "➕ Add Public Channel", callback_data: "admin_fsub_prompt public", style: "primary" }
  ],
  [
    { text: "➕ Add Private Channel", callback_data: "admin_fsub_prompt private", style: "primary" },
    { text: "➕ Add Request Channel", callback_data: "admin_fsub_prompt request", style: "primary" }
  ]
];

if (fsub_channels.length > 0) {
  buttons.push([
    { text: "🗑 Remove Channel", callback_data: "admin_fsub_remove", style: "danger" }
  ]);
}

buttons.push([
  { text: "🔙 Back to Admin Panel", callback_data: "/admin", style: "primary" }
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
