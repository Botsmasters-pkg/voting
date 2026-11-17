/*CMD
  command: on_vote_member_error
  help: Fallback callback when membership check cannot be performed
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

var voter_id = null;
if (user && user.telegramid) {
  voter_id = user.telegramid;
} else {
  voter_id = Bot.getProperty("last_voter_id");
}

var pctx = voter_id ? getPropJson("pending_vote_context_" + voter_id, null) : null;
var gid = pctx ? pctx.gid : null;
var participant_id = pctx ? pctx.target_uid : null;
var cb_chat_id = (pctx && pctx.cb_chat_id !== "none") ? pctx.cb_chat_id : null;
var cb_message_id = (pctx && pctx.cb_message_id !== "none") ? pctx.cb_message_id : null;
var cb_id = (pctx && pctx.cb_id !== "none") ? pctx.cb_id : null;

if (!gid && params) {
  var raw_params = (params || "").trim().split(/\s+/);
  if (raw_params.length >= 2) {
    gid = raw_params[0];
    participant_id = raw_params[1];
  }
}

function answerCb(msg, alert) {
  var target_id = cb_id;
  if (!target_id && request && request.callback_query) {
    target_id = request.callback_query.id;
  }
  if (target_id) {
    Api.answerCallbackQuery({
      callback_query_id: target_id,
      text: msg || "",
      show_alert: !!alert
    });
  }
}

var all_giveaways = getPropJson("all_giveaways", {});
var giveaway = all_giveaways[gid];

if (!giveaway) {
  answerCb("❌ Contest data nahi mila.", true);
  return;
}

giveaway.vote_counts = giveaway.vote_counts || {};
giveaway.vote_records = giveaway.vote_records || {};
giveaway.voted_users = giveaway.voted_users || {};
giveaway.voted_users[participant_id] = giveaway.voted_users[participant_id] || [];

var vote_key = (voter_id || "voter") + "_" + participant_id;
if (giveaway.vote_records[vote_key] || (voter_id && giveaway.voted_users[participant_id].indexOf(voter_id) !== -1)) {
  answerCb("⚠️ Aap pehle hi vote de chuke hain!", true);
  return;
}

var current_votes = (giveaway.vote_counts[participant_id] || 0) + 1;
giveaway.vote_counts[participant_id] = current_votes;
if (voter_id) {
  giveaway.voted_users[participant_id].push(voter_id);
}
giveaway.vote_records[vote_key] = {
  voter_id: voter_id,
  target_id: participant_id,
  voted_at: new Date().toISOString()
};

// Save channel and message identifiers
giveaway.vote_messages = giveaway.vote_messages || {};
if (cb_message_id) {
  giveaway.vote_messages[participant_id] = cb_message_id;
  giveaway.vote_messages[String(participant_id)] = cb_message_id;
  giveaway.vote_messages[Number(participant_id)] = cb_message_id;
}
if (cb_chat_id && (cb_chat_id.startsWith("-100") || cb_chat_id.startsWith("@"))) {
  giveaway.channel_chat_id = cb_chat_id;
}

all_giveaways[gid] = giveaway;
Bot.setProperty("all_giveaways", all_giveaways, "json");

var votes_given = User.getProperty("votes_given", 0);
User.setProperty("votes_given", votes_given + 1, "integer");

// UPDATE BUTTON IN CHANNEL IN REAL-TIME
var target_channel = cb_chat_id || giveaway.channel_chat_id || giveaway.channel;
var target_mid = cb_message_id || (giveaway.vote_messages && (giveaway.vote_messages[participant_id] || giveaway.vote_messages[String(participant_id)] || giveaway.vote_messages[Number(participant_id)]));

if (target_channel && target_mid) {
  var updated_button = [
    [
      { text: "Vote - " + current_votes, callback_data: "vote " + gid + " " + participant_id, style: "success" }
    ]
  ];

  Api.editMessageReplyMarkup({
    chat_id: target_channel,
    message_id: parseInt(target_mid, 10),
    reply_markup: { inline_keyboard: updated_button },
    on_error: "on_channel_post_error"
  });
}

answerCb("🎉 Vote recorded! Total: " + current_votes, false);
