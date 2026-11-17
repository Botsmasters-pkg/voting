/*CMD
  command: my_giveaways
  help: List active giveaways matching Python bot with instant callback answer & safe space routing
  need_reply: false
CMD*/

var OWNER_ID = 8710308658;

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

var all_giveaways = getPropJson("all_giveaways", {});
var uid = user.telegramid;
var target_chat = (chat && chat.chatid) ? chat.chatid : user.telegramid;

var buttons = [];

for (var gid in all_giveaways) {
  var g = all_giveaways[gid];
  if (!g) continue;
  var is_creator = (g.creator == uid || g.creator_id == uid || String(g.creator) === String(uid) || String(g.creator_id) === String(uid));
  var is_owner = (uid == OWNER_ID || String(uid) === String(OWNER_ID));
  var is_active = (!g.ended && g.status !== "ended");

  if ((is_creator || is_owner) && is_active) {
    var ch_disp = g.channel_display || g.channel || gid;
    buttons.push([
      { text: "📢 " + ch_disp, callback_data: "manage_giveaway " + gid, style: "primary" }
    ]);
  }
}

if (buttons.length === 0) {
  buttons.push([
    { text: "CREATE NEW", callback_data: "create_giveaway", style: "primary" }
  ]);
}

buttons.push([
  { text: "MAIN MENU", callback_data: "/start", style: "primary" }
]);

var text = "<b>💰 YOUR GIVEAWAYS</b>";

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
