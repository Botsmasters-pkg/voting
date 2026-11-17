/*CMD
  command: vote
  help: Cast vote for participant with channel membership check & duplicate vote guards
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

var raw = (options && options.giveaway_id) ? (options.giveaway_id + "_" + (options.target_uid || "")) : (params || "").trim();
if (raw.indexOf("vote_") === 0) {
  raw = raw.replace("vote_", "");
}

var parts = raw.split(/[\s_]+/);
if (parts.length < 2) {
  answer("❌ Invalid Vote Request", true);
  return;
}

var gid = parts[0].trim();
var target_uid = parts[1].trim();
var voter_id = user.telegramid;

// Guard 1: Cannot vote for oneself (Matching Python Bot)
if (String(voter_id) === String(target_uid)) {
  answer("❌ Aap khud ko vote nahi kar sakte!", true);
  return;
}

var all_giveaways = getPropJson("all_giveaways", {});
var giveaway = all_giveaways[gid];

if (!giveaway) {
  answer("❌ Contest exist nahi karta ya delete ho chuka hai.", true);
  return;
}

if (giveaway.ended || giveaway.status === "ended") {
  answer("🛑 Contest khatam ho chuka hai.", true);
  return;
}

giveaway.vote_records = giveaway.vote_records || {};
giveaway.vote_counts = giveaway.vote_counts || {};
giveaway.users = giveaway.users || {};

var vote_key = voter_id + "_" + target_uid;

// Guard 2: Already voted for this participant (Matching Python Bot)
if (giveaway.vote_records[vote_key]) {
  answer("⚠️ Aap is user ko already vote kar chuke ho!", true);
  return;
}

// Guard 3: Participants cannot cross-vote (Matching Python Bot)
if (giveaway.users[voter_id] && giveaway.users[target_uid]) {
  answer("❌ Giveaway participants ek doosre ko vote nahi kar sakte! Sirf bahar wale vote kar sakte hain.", true);
  return;
}

// Channel Membership Check
var target_channel = giveaway.channel;
if (target_channel) {
  Bot.setProperty("pending_vote_context_" + voter_id, {
    gid: gid,
    target_uid: target_uid,
    cb_id: (request && request.callback_query ? request.callback_query.id : (request ? request.id : null))
  }, "json");

  Api.getChatMember({
    chat_id: target_channel,
    user_id: voter_id,
    on_result: "on_vote_member_check",
    on_error: "on_vote_member_error"
  });
  return;
}

// Direct vote recording if no channel constraint
giveaway.vote_records[vote_key] = {
  voter_id: voter_id,
  target_id: target_uid,
  voted_at: new Date().toISOString()
};

giveaway.vote_counts[target_uid] = (giveaway.vote_counts[target_uid] || 0) + 1;
var new_votes = giveaway.vote_counts[target_uid];

all_giveaways[gid] = giveaway;
Bot.setProperty("all_giveaways", all_giveaways, "json");

var v_given = User.getProperty("votes_given", 0);
User.setProperty("votes_given", v_given + 1, "integer");

answer("🎉 Vote recorded!", false);

// Update button in channel
if (request && request.callback_query && request.callback_query.message) {
  var new_markup = {
    inline_keyboard: [[
      { text: "Vote - " + new_votes, callback_data: "vote_" + gid + "_" + target_uid, style: "success" }
    ]]
  };
  Api.editMessageReplyMarkup({
    chat_id: request.callback_query.message.chat.id,
    message_id: request.callback_query.message.message_id,
    reply_markup: new_markup
  });
}
