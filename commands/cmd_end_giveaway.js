/*CMD
  command: cmd_end_giveaway
  help: End contest, announce winner in channel, and stop further voting
  need_reply: false
CMD*/

var OWNER_ID = 8710308658;

function answer(msg, alert) {
  var cb_id = (request && request.callback_query) ? request.callback_query.id : (request ? request.id : null);
  if (cb_id) {
    Api.answerCallbackQuery({
      callback_query_id: cb_id,
      text: msg || "",
      show_alert: !!alert
    });
  }
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

var uid = user.telegramid;
if (uid != OWNER_ID && giveaway.creator_id != uid) {
  Bot.sendMessage("🚫 Access Denied.");
  return;
}

if (giveaway.status === "ended") {
  answer("⚠️ Ye contest pehle se hi END ho chuka hai!", true);
  Bot.runCommand("manage_giveaway " + gid);
  return;
}

// Mark as ended
giveaway.status = "ended";
giveaway.ended_at = new Date().toISOString();

// Calculate #1 Winner
var participants = giveaway.participants || [];
var vote_counts = giveaway.vote_counts || {};

var winner = null;
var max_votes = -1;

for (var i = 0; i < participants.length; i++) {
  var p = participants[i];
  var v = vote_counts[p.id] || 0;
  if (v > max_votes) {
    max_votes = v;
    winner = p;
  }
}

all_giveaways[gid] = giveaway;
Bot.setProperty("all_giveaways", all_giveaways, "json");

var winner_name = winner ? winner.name : "Koi partcipant nahi";
var winner_handle = winner && winner.username ? ("@" + winner.username) : "";
var winner_votes = (max_votes > 0) ? max_votes : 0;

// Post winner announcement to the channel
var channel_winner_post = 
  "🏆 <b>CONTEST CONCLUDED - WINNER ANNOUNCED!</b> 🏆\n\n" +
  "🎯 <b>Contest:</b> " + giveaway.title + "\n" +
  "🆔 <b>Contest ID:</b> <code>#" + gid + "</code>\n\n" +
  "🥇 <b>WINNER:</b> <b>" + winner_name + "</b> " + winner_handle + "\n" +
  "🗳 <b>Total Winning Votes:</b> <code>" + winner_votes + " Votes</code>\n\n" +
  "🎉 <i>Heartiest congratulations to the winner! Thanks to all participants!</i>";

Api.sendMessage({
  chat_id: giveaway.channel,
  text: channel_winner_post,
  parse_mode: "HTML"
});

answer("🛑 Contest Ended & Winner Announced in Channel!", true);

Bot.sendMessage(
  "🛑 <b>CONTEST SUCCESSFULLY ENDED!</b>\n\n" +
  "🏆 <b>Title:</b> " + giveaway.title + "\n" +
  "📢 <b>Channel:</b> <code>" + giveaway.channel + "</code>\n\n" +
  "🥇 <b>Winner:</b> " + winner_name + " " + winner_handle + " (" + winner_votes + " Votes)\n\n" +
  "✅ <i>Channel me official winner announcement post kar di gayi hai aur voting close ho chuki hai!</i>",
  { parse_mode: "HTML" }
);

Bot.runCommand("manage_giveaway " + gid);
