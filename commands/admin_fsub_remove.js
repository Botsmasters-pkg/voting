/*CMD
  command: admin_fsub_remove
  help: Remove a channel from Force Sub list
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
var param_str = (params || "").trim();

if (param_str.indexOf("do ") === 0) {
  var target_chat_id = param_str.replace("do ", "").trim();
  var removed = null;
  var updated = [];

  for (var i = 0; i < fsub_channels.length; i++) {
    if (fsub_channels[i].chat_id === target_chat_id) {
      removed = fsub_channels[i];
    } else {
      updated.push(fsub_channels[i]);
    }
  }

  Bot.setProperty("fsub_channels", updated, "json");

  var success_text = "✅ <b>Channel Removed from Force Sub!</b>\n\n" +
    (removed ? ("📢 <b>" + removed.title + "</b> (<code>" + removed.chat_id + "</code>)") : "") +
    "\n\n<i>Ab yeh channel user verification list me nahi aayega.</i>";

  var buttons = [
    [{ text: "📋 View Channel List", callback_data: "admin_fsub_list", style: "primary" }],
    [{ text: "🔙 Back to F-Sub Menu", callback_data: "admin_fsub", style: "primary" }]
  ];

  if (request && request.callback_query && request.callback_query.message) {
    Api.editMessageText({
      chat_id: request.callback_query.message.chat.id,
      message_id: request.callback_query.message.message_id,
      text: success_text,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: buttons }
    });
  } else {
    Api.sendMessage({
      chat_id: user.telegramid,
      text: success_text,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: buttons }
    });
  }
  return;
}

if (fsub_channels.length === 0) {
  var empty_text = "⚠️ <b>Koi bhi Force Sub channel add nahi hai!</b>";
  var back_btn = [[{ text: "🔙 Back", callback_data: "admin_fsub", style: "primary" }]];
  if (request && request.callback_query && request.callback_query.message) {
    Api.editMessageText({
      chat_id: request.callback_query.message.chat.id,
      message_id: request.callback_query.message.message_id,
      text: empty_text,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: back_btn }
    });
  } else {
    Api.sendMessage({
      chat_id: user.telegramid,
      text: empty_text,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: back_btn }
    });
  }
  return;
}

var remove_text = 
  "🗑 <b>SELECT CHANNEL TO REMOVE FROM FORCE SUB</b> 🗑\n\n" +
  "Neeche diye gaye channel me se jise hatana chahte hain us par click karein:";

var remove_buttons = [];
for (var j = 0; j < fsub_channels.length; j++) {
  var item = fsub_channels[j];
  var label = (item.type === "request" ? "🟡 " : (item.type === "private" ? "🔒 " : "🌐 ")) + item.title;
  remove_buttons.push([
    { text: "🗑 " + label, callback_data: "admin_fsub_remove do " + item.chat_id, style: "danger" }
  ]);
}

remove_buttons.push([
  { text: "🔙 Cancel", callback_data: "admin_fsub", style: "primary" }
]);

if (request && request.callback_query && request.callback_query.message) {
  Api.editMessageText({
    chat_id: request.callback_query.message.chat.id,
    message_id: request.callback_query.message.message_id,
    text: remove_text,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: remove_buttons }
  });
} else {
  Api.sendMessage({
    chat_id: user.telegramid,
    text: remove_text,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: remove_buttons }
  });
}
