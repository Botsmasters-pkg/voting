/*CMD
  command: admin_fsub_list
  help: View detailed list of all added Force Sub channels with links and types
  need_reply: false
CMD*/

var OWNER_ID = 8710308658;
var uid = user.telegramid;

if (uid != OWNER_ID) return;

if (request && request.callback_query) {
  Api.answerCallbackQuery({
    callback_query_id: request.callback_query.id
  });
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
if (fsub_enabled === null || fsub_enabled === undefined) fsub_enabled = true;

var text = 
  "📋 <b>ACTIVE FORCE SUB CHANNELS LIST</b> 📋\n\n" +
  "<b>Status:</b> " + (fsub_enabled ? "🟢 ENABLED" : "🔴 DISABLED") + "\n" +
  "<b>Total Channels:</b> <code>" + fsub_channels.length + "</code>\n\n" +
  "━━━━━━━━━━━━━━━━━━━━━━\n";

if (fsub_channels.length === 0) {
  text += "⚠️ <i>Abhi koi bhi Force Sub channel add nahi hai.</i>\n\n" +
          "Neeche diye gaye button se naya channel add karein.";
} else {
  for (var i = 0; i < fsub_channels.length; i++) {
    var ch = fsub_channels[i];
    var type_badge = "";
    if (ch.type === "request") {
      type_badge = "🟡 <b>[REQUEST CHANNEL]</b> (Pending join = auto-verified)";
    } else if (ch.type === "private") {
      type_badge = "🔒 <b>[PRIVATE CHANNEL]</b>";
    } else {
      type_badge = "🌐 <b>[PUBLIC CHANNEL]</b>";
    }

    text += "<b>" + (i + 1) + ". " + ch.title + "</b>\n" +
            "   📌 <b>Type:</b> " + type_badge + "\n" +
            "   🆔 <b>Chat ID:</b> <code>" + ch.chat_id + "</code>\n" +
            "   🔗 <b>Link:</b> <a href=\"" + ch.link + "\">" + ch.link + "</a>\n\n";
  }
  text += "━━━━━━━━━━━━━━━━━━━━━━\n" +
          "<i>Users bot start karne par in sabhi channels ko 3x3 JOIN primary grid me dekhenge.</i>";
}

var buttons = [];

if (fsub_channels.length > 0) {
  buttons.push([
    { text: "🗑 Remove a Channel", callback_data: "admin_fsub_remove", style: "danger" }
  ]);
}

buttons.push([
  { text: "➕ Add Channel", callback_data: "admin_fsub", style: "primary" },
  { text: "🔙 F-Sub Menu", callback_data: "admin_fsub", style: "primary" }
]);

var target_chat = (chat && chat.chatid) ? chat.chatid : user.telegramid;

if (request && request.callback_query && request.callback_query.message) {
  Api.editMessageText({
    chat_id: request.callback_query.message.chat.id,
    message_id: request.callback_query.message.message_id,
    text: text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: { inline_keyboard: buttons }
  });
} else {
  Api.sendMessage({
    chat_id: target_chat,
    text: text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: { inline_keyboard: buttons }
  });
}
