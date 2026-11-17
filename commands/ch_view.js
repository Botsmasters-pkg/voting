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

var target_chid = (params || User.getProperty("active_channel") || "").trim();
if (!target_chid) {
  Bot.runCommand("channel_tools");
  return;
}

User.setProperty("active_channel", target_chid, "string");
var channels = Bot.getProperty("connected_channels", {});
var ch_info = channels[target_chid] || {};

var title = ch_info.title || "Selected Channel";
var uname = ch_info.username ? ("@" + ch_info.username) : "Private Channel";
var added_by = ch_info.added_by ? (ch_info.added_by + " (ID: " + ch_info.added_by_id + ")") : "Admin";

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
