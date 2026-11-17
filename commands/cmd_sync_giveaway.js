/*CMD
  command: cmd_sync_giveaway
  help: Force sync all participant buttons in channel with current database vote counts
  need_reply: false
CMD*/

if (request && request.callback_query) {
  Api.answerCallbackQuery({
    callback_query_id: request.callback_query.id,
    text: "🔄 Syncing channel buttons..."
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

var raw = (options && options.giveaway_id) ? options.giveaway_id : (params || "").trim();
var gid = String(raw).replace(/^cmd_sync_giveaway\s*/i, "").replace(/^giveaway\s*/i, "").replace(/^sync_/i, "").trim();

if (!gid) {
  Bot.runCommand("my_giveaways");
  return;
}

var all_giveaways = getPropJson("all_giveaways", {});
var giveaway = all_giveaways[gid];

if (!giveaway) {
  Bot.sendMessage("❌ Contest not found!");
  return;
}

var target_channel = giveaway.channel_chat_id || giveaway.channel;
var vote_counts = giveaway.vote_counts || {};
var vote_messages = giveaway.vote_messages || {};

var synced_count = 0;
var total_participants = 0;

if (giveaway.users) {
  total_participants = Object.keys(giveaway.users).length;
}

for (var p_id in vote_messages) {
  var mid = vote_messages[p_id];
  if (mid && target_channel) {
    var votes = vote_counts[p_id] || 0;
    Api.editMessageReplyMarkup({
      chat_id: target_channel,
      message_id: parseInt(mid, 10),
      reply_markup: {
        inline_keyboard: [[
          { text: "Vote - " + votes, callback_data: "vote " + gid + " " + p_id, style: "success" }
        ]]
      },
      on_error: "on_channel_post_error"
    });
    synced_count++;
  }
}

var sync_msg = 
  "🔄 <b>CHANNEL BUTTONS SYNC STATUS</b> 🔄\n\n" +
  "📢 <b>Channel:</b> <code>" + (giveaway.channel || "None") + "</code>\n" +
  "👥 <b>Total Participants:</b> <code>" + total_participants + "</code>\n" +
  "✅ <b>Synced in Channel:</b> <code>" + synced_count + "</code>\n\n" +
  (synced_count === total_participants ? "✨ <i>Sabhi participants ke channel buttons successfully update ho gaye hain!</i>" : "ℹ️ <i>Baqi participants ka message channel me ek baar tap hote hi automatic sync ho jayega.</i>");

var buttons = [
  [{ text: "🔙 Management Panel", callback_data: "manage_giveaway " + gid, style: "primary" }]
];

var target_chat = (chat && chat.chatid) ? chat.chatid : user.telegramid;

if (request && request.callback_query && request.callback_query.message) {
  Api.editMessageText({
    chat_id: request.callback_query.message.chat.id,
    message_id: request.callback_query.message.message_id,
    text: sync_msg,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: buttons }
  });
} else {
  Api.sendMessage({
    chat_id: target_chat,
    text: sync_msg,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: buttons }
  });
}
