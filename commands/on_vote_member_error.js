/*CMD
  command: on_vote_member_error
  help: Fallback callback when membership check cannot be performed
  need_reply: false
CMD*/

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

var raw_params = (params || "").trim().split(/\s+/);
var gid = raw_params[0];
var participant_id = raw_params[1];
var voter_id = user.telegramid;

if (!gid || !participant_id) {
  var pctx = getPropJson("pending_vote_context_" + voter_id, null);
  if (pctx) {
    gid = pctx.gid;
    participant_id = pctx.target_uid;
  }
}

var all_giveaways = getPropJson("all_giveaways", {});
var giveaway = all_giveaways[gid];

if (!giveaway) {
  answer("❌ Contest data nahi mila.", true);
  return;
}

giveaway.vote_counts = giveaway.vote_counts || {};
giveaway.vote_records = giveaway.vote_records || {};
giveaway.voted_users = giveaway.voted_users || {};
giveaway.voted_users[participant_id] = giveaway.voted_users[participant_id] || [];

var vote_key = voter_id + "_" + participant_id;
if (giveaway.vote_records[vote_key] || giveaway.voted_users[participant_id].indexOf(voter_id) !== -1) {
  answer("⚠️ Aap pehle hi vote de chuke hain!", true);
  return;
}

var current_votes = (giveaway.vote_counts[participant_id] || 0) + 1;
giveaway.vote_counts[participant_id] = current_votes;
giveaway.voted_users[participant_id].push(voter_id);
giveaway.vote_records[vote_key] = {
  voter_id: voter_id,
  target_id: participant_id,
  voted_at: new Date().toISOString()
};

all_giveaways[gid] = giveaway;
Bot.setProperty("all_giveaways", all_giveaways, "json");

var votes_given = User.getProperty("votes_given", 0);
User.setProperty("votes_given", votes_given + 1, "integer");

if (request && request.callback_query && request.callback_query.message) {
  var chat_id = request.callback_query.message.chat.id;
  var message_id = request.callback_query.message.message_id;

  var updated_button = [
    [
      { text: "Vote - " + current_votes, callback_data: "vote " + gid + " " + participant_id, style: "success" }
    ]
  ];

  Api.editMessageReplyMarkup({
    chat_id: chat_id,
    message_id: message_id,
    reply_markup: { inline_keyboard: updated_button }
  });
}

answer("🎉 Vote recorded! Total: " + current_votes, false);

answer("✅ Vote registered! Total: " + current_votes, false);
