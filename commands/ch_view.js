/*CMD
  command: ch_view
  help: View channel details (Chat ID) and show action buttons
  need_reply: false
CMD*/

var OWNER_ID = 8710308658;
if (user.telegramid != OWNER_ID) {
  Bot.sendMessage("🚫 Access Denied.");
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

var target_chid = (params || User.getProperty("active_channel") || "").trim();
if (!target_chid) {
  Bot.runCommand("channel_tools");
  return;
}

User.setProperty("active_channel", target_chid, "string");
var channels = getPropJson("connected_channels", {});
var ch_info = channels[target_chid] || {};

// If numeric chat ID missing, try to find in channels or query Telegram
if (!ch_info.id || ch_info.id.startsWith("@")) {
  for (var k in channels) {
    if (channels[k] && channels[k].username && ("@" + channels[k].username.toLowerCase()) === target_chid.toLowerCase()) {
      ch_info = channels[k];
      target_chid = ch_info.id;
      break;
    }
  }
}

// Fetch live Telegram chat info to keep details fresh
Api.getChat({
  chat_id: target_chid,
  on_result: "on_channel_chat_info"
});

var title = ch_info.title || target_chid;
var uname = ch_info.username ? ("@" + ch_info.username) : (target_chid.startsWith("@") ? target_chid : "Private Channel");
var added_by = ch_info.added_by ? (ch_info.added_by + (ch_info.added_by_id ? (" (ID: " + ch_info.added_by_id + ")") : "")) : "Admin";

var text = 
  "🎛 <b>CHANNEL MANAGEMENT PANEL</b> 🎛\n\n" +
  "📢 <b>Title:</b> " + title + "\n" +
  "🆔 <b>Chat ID:</b> <code>" + target_chid + "</code>\n" +
  "🔗 <b>Username:</b> " + uname + "\n" +
  "👤 <b>Connected By:</b> " + added_by + "\n\n" +
  "<i>Neeche diye gaye buttons se action select karein:</i>";

var buttons = [
  [
    { text: "🔗 Get Channel Link", callback_data: "ch_get_link " + target_chid, style: "success" }
  ],
  [
    { text: "⬆️ Promote User", callback_data: "ch_promote " + target_chid, style: "success" },
    { text: "⬇️ Demote User", callback_data: "ch_demote " + target_chid, style: "primary" }
  ],
  [
    { text: "🗑 Delete Message", callback_data: "ch_delete_msg " + target_chid, style: "primary" },
    { text: "❌ Remove Channel", callback_data: "ch_remove_confirm " + target_chid, style: "primary" }
  ],
  [
    { text: "🔙 Back to Channels List", callback_data: "channel_tools", style: "primary" }
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
