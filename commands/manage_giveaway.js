/*CMD
  command: manage_giveaway
  help: Contest Management Panel exactly matching Python bot with safe space routing & callback answer
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

var raw = (options && options.giveaway_id) ? options.giveaway_id : (params || "").trim();
var gid = String(raw).replace(/^manage_giveaway\s*/i, "").replace(/^giveaway\s*/i, "").replace(/^manage_/i, "").trim();

if (!gid) {
  Bot.runCommand("my_giveaways");
  return;
}

var all_giveaways = getPropJson("all_giveaways", {});
var giveaway = all_giveaways[gid];
var target_chat = (chat && chat.chatid) ? chat.chatid : user.telegramid;

if (!giveaway) {
  var not_found_text = "<b>❌ Not found!</b>";
  var not_found_btn = [[{ text: "BACK", callback_data: "my_giveaways", style: "primary" }]];
  if (request && request.callback_query && request.callback_query.message) {
    Api.editMessageText({
      chat_id: request.callback_query.message.chat.id,
      message_id: request.callback_query.message.message_id,
      text: not_found_text,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: not_found_btn }
    });
  } else {
    Api.sendMessage({
      chat_id: target_chat,
      text: not_found_text,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: not_found_btn }
    });
  }
  return;
}

var uid = user.telegramid;
var is_creator = (giveaway.creator == uid || giveaway.creator_id == uid || String(giveaway.creator) === String(uid) || String(giveaway.creator_id) === String(uid));
var is_owner = (uid == OWNER_ID || String(uid) === String(OWNER_ID));

if (!is_creator && !is_owner) {
  Bot.sendMessage("🚫 Access Denied: Aap is giveaway ke creator nahi hain.");
  return;
}

var is_ended = giveaway.ended || giveaway.status === "ended";
var status = is_ended ? "🔴 ENDED" : "🟢 ACTIVE";
var ch_display = giveaway.channel_display || giveaway.channel || "Channel";

var joined_count = 0;
if (giveaway.users && typeof giveaway.users === "object") {
  joined_count = Object.keys(giveaway.users).length;
} else if (giveaway.participants && Array.isArray(giveaway.participants)) {
  joined_count = giveaway.participants.length;
}

var prize_info = giveaway.title || giveaway.prize || "";
var text = 
  "<b>➡️ MANAGEMENT PANEL</b>\n\n" +
  "<b>Status:</b> " + status + "\n" +
  "<b>Channel:</b> " + ch_display + "\n" +
  (prize_info ? ("🏆 <b>Prize:</b> " + prize_info + "\n") : "") +
  "<b>Joined:</b> " + joined_count;

var buttons = [
  [
    { text: "ADD VOTES", callback_data: "cmd_add_votes " + gid, style: "primary" },
    { text: "REMOVE VOTES", callback_data: "cmd_remove_votes " + gid, style: "danger" }
  ],
  [
    { text: "LEADERBOARD", callback_data: "cmd_leaderboard " + gid, style: "primary" }
  ],
  [
    { text: "END GIVEAWAY", callback_data: "cmd_end_giveaway " + gid, style: "danger" }
  ]
];

if (is_owner) {
  buttons.push([
    { text: "🔙 Live Contests", callback_data: "admin_giveaways", style: "primary" },
    { text: "⚙️ Admin Dashboard", callback_data: "/admin", style: "primary" }
  ]);
} else {
  buttons.push([
    { text: "BACK", callback_data: "my_giveaways", style: "primary" }
  ]);
}

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
