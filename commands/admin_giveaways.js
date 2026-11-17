/*CMD
  command: admin_giveaways
  help: Admin Contests & Giveaways Suite: view active contests across all channels with full edit, vote add/cut, and end controls
  need_reply: false
CMD*/

var OWNER_ID = 8710308658;
var uid = user.telegramid;

if (request && request.callback_query) {
  Api.answerCallbackQuery({
    callback_query_id: request.callback_query.id
  });
}

if (uid != OWNER_ID) {
  Bot.sendMessage("🚫 <b>Access Denied:</b> Sirf Bot Admin ke liye available hai.", { parse_mode: "HTML" });
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

var all_giveaways = getPropJson("all_giveaways", {});
var target_chat = (chat && chat.chatid) ? chat.chatid : user.telegramid;

var active_contests = [];
var ended_contests = [];

for (var gid in all_giveaways) {
  var g = all_giveaways[gid];
  if (!g) continue;
  
  var is_ended = (g.ended || g.status === "ended");
  var p_count = 0;
  if (g.users && typeof g.users === "object") {
    p_count = Object.keys(g.users).length;
  } else if (g.participants && Array.isArray(g.participants)) {
    p_count = g.participants.length;
  }
  
  var tot_votes = 0;
  if (g.vote_counts) {
    for (var u in g.vote_counts) {
      tot_votes += (g.vote_counts[u] || 0);
    }
  }

  var item = {
    id: gid,
    channel: g.channel_display || g.channel || "Channel",
    title: g.title || g.prize || ("Contest #" + gid),
    participants: p_count,
    votes: tot_votes,
    creator_name: g.creator_name || "User",
    creator_id: g.creator || g.creator_id || "Unknown"
  };

  if (is_ended) {
    ended_contests.push(item);
  } else {
    active_contests.push(item);
  }
}

var text = 
  "🏆 <b>ADMIN CONTESTS & GIVEAWAYS CONTROL</b> 🏆\n\n" +
  "Yahan se aap bot me chal rahe <b>sabhi channels ke giveaways</b> ko full control kar sakte hain:\n" +
  "• Votes badha (Add) ya ghata (Remove) sakte hain\n" +
  "• Leaderboard dekh sakte hain\n" +
  "• Kisi bhi channel ka giveaway END kar sakte hain\n\n";

var buttons = [];

if (active_contests.length === 0 && ended_contests.length === 0) {
  text += "⚠️ <i>Abhi tak bot me koi bhi contest create nahi hua hai.</i>\n";
} else {
  text += "🟢 <b>ACTIVE GIVEAWAYS (" + active_contests.length + "):</b>\n";
  if (active_contests.length === 0) {
    text += "<i>Abhi koi active giveaway nahi chal raha hai.</i>\n\n";
  } else {
    for (var i = 0; i < active_contests.length; i++) {
      var ac = active_contests[i];
      text += "<b>" + (i + 1) + ".</b> 📢 <code>" + ac.channel + "</code>\n" +
              "   🏆 <b>Prize:</b> " + ac.title + "\n" +
              "   👥 Participants: <code>" + ac.participants + "</code> | 🗳 Total Votes: <code>" + ac.votes + "</code>\n\n";
      
      var btn_label = "⚙️ " + ac.channel + " • " + (ac.title.length > 18 ? (ac.title.substring(0, 16) + "..") : ac.title);
      buttons.push([
        { text: btn_label, callback_data: "manage_giveaway " + ac.id, style: "success" }
      ]);
    }
  }

  if (ended_contests.length > 0) {
    text += "━━━━━━━━━━━━━━━━━━━\n" +
            "🔴 <b>ENDED GIVEAWAYS (" + ended_contests.length + "):</b>\n";
    var limit_ended = Math.min(ended_contests.length, 5);
    for (var j = 0; j < limit_ended; j++) {
      var ec = ended_contests[j];
      buttons.push([
        { text: "🔴 " + ec.channel + " • " + (ec.title.length > 16 ? (ec.title.substring(0, 14) + "..") : ec.title) + " (Ended)", callback_data: "manage_giveaway " + ec.id, style: "primary" }
      ]);
    }
  }
}

buttons.push([
  { text: "🔄 Refresh List", callback_data: "admin_giveaways", style: "primary" },
  { text: "➕ Create New", callback_data: "create_giveaway", style: "success" }
]);

buttons.push([
  { text: "🔙 Back to Admin Panel", callback_data: "/admin", style: "primary" }
]);

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
