/*CMD
  command: my_stats
  help: Show user account stats exactly matching Python bot
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

var all_giveaways = getPropJson("all_giveaways", {});
var uid = user.telegramid;

var created_count = 0;
var active_created = 0;
var ended_created = 0;

var joined_count = 0;
var total_votes_received = 0;

for (var gid in all_giveaways) {
  var g = all_giveaways[gid];
  if (!g) continue;
  
  if (g.creator == uid || g.creator_id == uid) {
    created_count++;
    if (g.ended || g.status === "ended") {
      ended_created++;
    } else {
      active_created++;
    }
  }

  var in_users = (g.users && g.users[uid]);
  if (!in_users && g.participants) {
    for (var i = 0; i < g.participants.length; i++) {
      if (g.participants[i].id == uid) {
        in_users = true;
        break;
      }
    }
  }

  if (in_users) {
    joined_count++;
    if (g.vote_counts && g.vote_counts[uid]) {
      total_votes_received += g.vote_counts[uid];
    }
  }
}

var total_votes_given = User.getProperty("votes_given", 0);
var joined_date = User.getProperty("joined_date", "Recently");
var full_name = (user.first_name || "User") + (user.last_name ? (" " + user.last_name) : "");

var text = 
  "<b>📊 YOUR STATS</b>\n\n" +
  "<b>👤 Name:</b> " + full_name + "\n" +
  "<b>🆔 ID:</b> <code>" + uid + "</code>\n" +
  "<b>📅 Joined:</b> " + joined_date + "\n\n" +
  "<b>🎁 Giveaways Created:</b> " + created_count + "\n" +
  "  ├ 🟢 Active: " + active_created + "\n" +
  "  └ 🔴 Ended: " + ended_created + "\n\n" +
  "<b>🎯 Giveaways Joined:</b> " + joined_count + "\n" +
  "<b>🗳️ Votes Given:</b> " + total_votes_given + "\n" +
  "<b>💎 Votes Received:</b> " + total_votes_received + "\n\n" +
  "<i>Keep participating to grow your stats!</i>";

var buttons = [
  [{ text: "🔙 BACK", callback_data: "go_back_home", style: "primary" }]
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
