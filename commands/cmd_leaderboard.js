/*CMD
  command: cmd_leaderboard
  help: View Top Participants ranking leaderboard for contest
  need_reply: false
CMD*/

function getPropJson(name, default_val) {
  var val = Bot.getProperty(name);
  if (!val) return default_val;
  if (typeof val === "object") return val;
  if (typeof val === "string") {
    try { return JSON.parse(val) || default_val; } catch (e) { return default_val; }
  }
  return default_val;
}

var gid = (params || "").trim();
if (!gid) {
  Bot.runCommand("my_giveaways");
  return;
}

var all_giveaways = getPropJson("all_giveaways", {});
var giveaway = all_giveaways[gid];

if (!giveaway) {
  Bot.sendMessage("❌ Contest data nahi mila.");
  Bot.runCommand("my_giveaways");
  return;
}

var participants = giveaway.participants || [];
var vote_counts = giveaway.vote_counts || {};

// Sort participants by votes descending
var ranked = [];
for (var i = 0; i < participants.length; i++) {
  var p = participants[i];
  var v = vote_counts[p.id] || 0;
  ranked.push({
    id: p.id,
    name: p.name || "User",
    username: p.username ? ("@" + p.username) : "No username",
    votes: v
  });
}

ranked.sort(function(a, b) {
  return b.votes - a.votes;
});

var medals = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

var text = 
  "🏆 <b>CONTEST LEADERBOARD</b> 🏆\n\n" +
  "🎯 <b>Contest:</b> " + giveaway.title + "\n" +
  "🆔 <b>Contest ID:</b> <code>" + gid + "</code>\n" +
  "📢 <b>Channel:</b> <code>" + giveaway.channel + "</code>\n\n" +
  "━━━━━━━━━━━━━━━━━━━━━━\n";

if (ranked.length === 0) {
  text += "⚠️ <i>Abhi tak kisi bhi user ne contest join nahi kiya hai.</i>\n";
} else {
  var limit = Math.min(ranked.length, 10);
  for (var j = 0; j < limit; j++) {
    var r = ranked[j];
    var medal = medals[j] || ("#" + (j + 1));
    text += medal + " <b>" + r.name + "</b> (" + r.username + ")\n" +
            "   🆔 ID: <code>" + r.id + "</code> • 🗳 <b>" + r.votes + " Votes</b>\n\n";
  }
}

text += "━━━━━━━━━━━━━━━━━━━━━━\n" +
        "<i>Total Participants: " + ranked.length + "</i>";

var buttons = [
  [{ text: "🔄 Refresh Ranking", callback_data: "cmd_leaderboard " + gid, style: "success" }],
  [{ text: "🔙 Back to Contest", callback_data: "manage_giveaway " + gid, style: "primary" }]
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
