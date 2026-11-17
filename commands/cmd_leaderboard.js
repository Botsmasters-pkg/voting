/*CMD
  command: cmd_leaderboard
  help: Show contest leaderboard exactly matching Python bot
  need_reply: false
CMD*/

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

var raw = (options && options.giveaway_id) ? options.giveaway_id : (params || "").trim();
var gid = String(raw).replace(/^cmd_leaderboard\s*/i, "").replace(/^giveaway\s*/i, "").replace(/^leaderboard_/i, "").trim();

if (!gid) {
  Bot.runCommand("my_giveaways");
  return;
}

var all_giveaways = getPropJson("all_giveaways", {});
var giveaway = all_giveaways[gid];

if (!giveaway) {
  Bot.sendMessage("❌ Contest not found!");
  Bot.runCommand("my_giveaways");
  return;
}

var users = giveaway.users || {};
var vote_counts = giveaway.vote_counts || {};

if (Object.keys(users).length === 0 && giveaway.participants) {
  for (var i = 0; i < giveaway.participants.length; i++) {
    var p = giveaway.participants[i];
    users[p.id] = p.name || ("User " + p.id);
  }
}

var items = [];
for (var uid in vote_counts) {
  items.push({
    uid: uid,
    name: users[uid] || ("User " + uid),
    votes: vote_counts[uid] || 0
  });
}

items.sort(function(a, b) {
  return b.votes - a.votes;
});

var top10 = items.slice(0, 10);

var text = "<b>🗓 LEADERBOARD</b>\n\n";
if (top10.length === 0) {
  text += "<i>No votes yet.</i>";
} else {
  for (var j = 0; j < top10.length; j++) {
    text += "<b>" + (j + 1) + ".</b> " + top10[j].name + " - <b>" + top10[j].votes + " votes</b>\n";
  }
}

var buttons = [
  [{ text: "BACK", callback_data: "manage_giveaway " + gid, style: "primary" }]
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
