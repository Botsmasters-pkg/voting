/*CMD
  command: admin_giveaways
  help: Admin Live Giveaways Suite: view ONLY active running giveaways across channels with full management controls
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

for (var gid in all_giveaways) {
  var g = all_giveaways[gid];
  if (!g) continue;
  
  // SKIP ended contests completely - ONLY show active running giveaways
  if (g.ended || g.status === "ended") {
    continue;
  }
  
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

  active_contests.push({
    id: gid,
    channel: g.channel_display || g.channel || "Channel",
    title: g.title || g.prize || ("Contest #" + gid),
    participants: p_count,
    votes: tot_votes,
    creator_name: g.creator_name || "User",
    creator_id: g.creator || g.creator_id || "Unknown"
  });
}

var text = 
  "🏆 <b>ADMIN LIVE GIVEAWAYS CONTROL</b> 🏆\n\n" +
  "Yahan se aap bot me <b>abhi chal rahe (LIVE) sabhi giveaways</b> ko manage kar sakte hain:\n" +
  "• Participants ke votes Add ya Remove karein\n" +
  "• Live Leaderboard ranking check karein\n" +
  "• Giveaway ko END karke winner announce karein\n\n";

var buttons = [];

if (active_contests.length === 0) {
  text += "⚠️ <i>Abhi kisi bhi channel me live giveaway nahi chal raha hai.</i>\n\n" +
          "Naya giveaway shuru karne ke liye neeche <b>➕ Create New</b> dabayein.";
} else {
  text += "🟢 <b>LIVE RUNNING GIVEAWAYS (" + active_contests.length + "):</b>\n\n";
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
