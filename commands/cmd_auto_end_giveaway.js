/*CMD
  command: cmd_auto_end_giveaway
  help: Automatically concludes contest when timer deadline expires and posts winner announcement to channel
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

var gid = (options && options.giveaway_id) ? options.giveaway_id : (params || "").trim();
if (!gid) return;

var all_giveaways = getPropJson("all_giveaways", {});
var giveaway = all_giveaways[gid];

if (!giveaway) return;

// If already ended manually, don't execute twice
if (giveaway.ended || giveaway.status === "ended") {
  return;
}

// Mark as ended
giveaway.ended = true;
giveaway.status = "ended";
giveaway.ended_at = new Date().toISOString();
giveaway.auto_ended = true;

var users = giveaway.users || {};
var vote_counts = giveaway.vote_counts || {};

if (Object.keys(users).length === 0 && giveaway.participants) {
  for (var i = 0; i < giveaway.participants.length; i++) {
    var p = giveaway.participants[i];
    users[p.id] = p.name || ("User " + p.id);
  }
}

var items = [];
for (var target_id in vote_counts) {
  items.push({
    uid: target_id,
    name: users[target_id] || ("User " + target_id),
    votes: vote_counts[target_id] || 0
  });
}

items.sort(function(a, b) {
  return b.votes - a.votes;
});

var winner_text = "No participants.";
if (items.length > 0) {
  winner_text = "🏆 <b>WINNER:</b> " + items[0].name + " with " + items[0].votes + " votes!";
}

all_giveaways[gid] = giveaway;
Bot.setProperty("all_giveaways", all_giveaways, "json");

// Post official conclusion to channel
var prize_title = giveaway.title || giveaway.prize || "";
var title_line = prize_title ? ("🎯 <b>Contest:</b> " + prize_title + "\n") : "";

var bot_uname = (Bot.getProperty("bot_username") || "").toLowerCase().replace("@", "");
var ch_str = String(giveaway.channel || "").toLowerCase().trim();
var ch_uname = ch_str.startsWith("@") ? ch_str.substring(1) : ch_str;
var is_bot = (ch_uname === bot_uname || ch_uname === "toxicvotesbot" || ch_uname.endsWith("bot"));

if (giveaway.channel && !is_bot) {
  var channel_msg = 
    "⏰ <b>TIME'S UP! CONTEST CONCLUDED!</b> 🏆\n\n" +
    title_line +
    "📌 <b>Contest ID:</b> <code>#" + gid + "</code>\n\n" +
    winner_text + "\n\n" +
    "🎉 <i>Heartiest congratulations to the winner! Thanks to all who participated!</i>";

  Api.sendMessage({
    chat_id: giveaway.channel,
    text: channel_msg,
    parse_mode: "HTML",
    on_error: "on_channel_post_error"
  });
}

// Notify Contest Creator
if (giveaway.creator || giveaway.creator_id) {
  var c_chat = giveaway.creator || giveaway.creator_id;
  Api.sendMessage({
    chat_id: c_chat,
    text: "⏰ <b>Contest Timer Expired!</b>\n\n" +
          "Aapke contest <code>" + (giveaway.title || gid) + "</code> ka samay poora ho gaya hai.\n\n" +
          winner_text + "\n\n" +
          "✅ <i>Channel me official winner announcement automatically post kar di gayi hai.</i>",
    parse_mode: "HTML"
  });
}

// Notify OWNER
var OWNER_ID = 8710308658;
Api.sendMessage({
  chat_id: OWNER_ID,
  text: "⏰ <b>CONTEST AUTO-ENDED BY TIMER</b>\n\n" +
        "📢 <b>Channel:</b> <code>" + giveaway.channel + "</code>\n" +
        "🏆 <b>Title:</b> " + (giveaway.title || gid) + "\n\n" +
        winner_text,
  parse_mode: "HTML"
});
