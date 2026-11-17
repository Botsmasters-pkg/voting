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

var all_giveaways = getPropJson("all_giveaways", {});
var giveaway = all_giveaways[gid];

if (!giveaway) {
  answer("❌ Contest exist nahi karta ya delete ho chuka hai.", true);
  return;
}

giveaway.vote_records = giveaway.vote_records || {};
giveaway.vote_counts = giveaway.vote_counts || {};
giveaway.users = giveaway.users || {};
giveaway.vote_messages = giveaway.vote_messages || {};

var cb_chat_id = "";
var cb_message_id = "";
var cb_id = "";

if (request && request.callback_query) {
  cb_id = request.callback_query.id || "";
  if (request.callback_query.message) {
    var cb_msg = request.callback_query.message;
    cb_message_id = String(cb_msg.message_id || "");
    if (cb_msg.chat && cb_msg.chat.id) {
      cb_chat_id = String(cb_msg.chat.id);
    }
  }
}

if (!cb_chat_id) {
  cb_chat_id = String(giveaway.channel_chat_id || giveaway.channel || "");
}
if (!cb_message_id && giveaway.vote_messages) {
  cb_message_id = String(giveaway.vote_messages[target_uid] || giveaway.vote_messages[String(target_uid)] || "");
}

// CRITICAL: Cache message_id IMMEDIATELY whenever any callback comes from the channel!
if (request && request.callback_query && request.callback_query.message) {
  var cb_msg = request.callback_query.message;
  giveaway.vote_messages[target_uid] = cb_msg.message_id;
  giveaway.vote_messages[String(target_uid)] = cb_msg.message_id;
  giveaway.vote_messages[Number(target_uid)] = cb_msg.message_id;
  if (cb_msg.chat && cb_msg.chat.id) {
    giveaway.channel_chat_id = cb_msg.chat.id;
  }
  all_giveaways[gid] = giveaway;
  Bot.setProperty("all_giveaways", all_giveaways, "json");
}

// Guard 0: Check if voter is banned
var banned_users = getPropJson("banned_users", []);
if (banned_users && (banned_users.indexOf(voter_id) !== -1 || banned_users.indexOf(Number(voter_id)) !== -1)) {
  answer("🚫 Aap is bot se banned hain!", true);
  return;
}

// Guard 1: Cannot vote for oneself (Matching Python Bot)
if (String(voter_id) === String(target_uid)) {
  // Sync button to latest database vote count on tap
  if (cb_chat_id && cb_message_id) {
    var cur_v1 = (giveaway.vote_counts && giveaway.vote_counts[target_uid]) ? giveaway.vote_counts[target_uid] : 0;
    Api.editMessageReplyMarkup({
      chat_id: cb_chat_id,
      message_id: parseInt(cb_message_id, 10),
      reply_markup: {
        inline_keyboard: [[
          { text: "Vote - " + cur_v1, callback_data: "vote " + gid + " " + target_uid, style: "success" }
        ]]
      },
      on_error: "on_channel_post_error"
    });
  }
  answer("❌ Aap khud ko vote nahi kar sakte!", true);
  return;
}

// Guard 1.5: Contest ended
if (giveaway.ended || giveaway.status === "ended") {
  if (cb_chat_id && cb_message_id) {
    var cur_ve = (giveaway.vote_counts && giveaway.vote_counts[target_uid]) ? giveaway.vote_counts[target_uid] : 0;
    Api.editMessageReplyMarkup({
      chat_id: cb_chat_id,
      message_id: parseInt(cb_message_id, 10),
      reply_markup: {
        inline_keyboard: [[
          { text: "Ended (" + cur_ve + " Votes)", callback_data: "vote " + gid + " " + target_uid, style: "danger" }
        ]]
      },
      on_error: "on_channel_post_error"
    });
  }
  answer("🛑 Contest khatam ho chuka hai.", true);
  return;
}

var vote_key = voter_id + "_" + target_uid;

// Guard 2: Already voted for this participant (Matching Python Bot)
if (giveaway.vote_records[vote_key] || (giveaway.voted_users && giveaway.voted_users[target_uid] && giveaway.voted_users[target_uid].indexOf(voter_id) !== -1)) {
  // Sync button to latest database vote count on tap
  if (cb_chat_id && cb_message_id) {
    var cur_v2 = (giveaway.vote_counts && giveaway.vote_counts[target_uid]) ? giveaway.vote_counts[target_uid] : 0;
    Api.editMessageReplyMarkup({
      chat_id: cb_chat_id,
      message_id: parseInt(cb_message_id, 10),
      reply_markup: {
        inline_keyboard: [[
          { text: "Vote - " + cur_v2, callback_data: "vote " + gid + " " + target_uid, style: "success" }
        ]]
      },
      on_error: "on_channel_post_error"
    });
  }
  answer("⚠️ Aap is user ko already vote kar chuke ho!", true);
  return;
}

// Guard 3: Participants cannot cross-vote (Matching Python Bot)
if (giveaway.users[voter_id] && giveaway.users[target_uid]) {
  if (cb_chat_id && cb_message_id) {
    var cur_v3 = (giveaway.vote_counts && giveaway.vote_counts[target_uid]) ? giveaway.vote_counts[target_uid] : 0;
    Api.editMessageReplyMarkup({
      chat_id: cb_chat_id,
      message_id: parseInt(cb_message_id, 10),
      reply_markup: {
        inline_keyboard: [[
          { text: "Vote - " + cur_v3, callback_data: "vote " + gid + " " + target_uid, style: "success" }
        ]]
      },
      on_error: "on_channel_post_error"
    });
  }
  answer("❌ Giveaway participants ek doosre ko vote nahi kar sakte! Sirf bahar wale vote kar sakte hain.", true);
  return;
}

// Channel Membership Check
var target_channel = giveaway.channel_chat_id || giveaway.channel;
if (target_channel) {
  var safe_chat = cb_chat_id ? cb_chat_id : "none";
  var safe_mid = cb_message_id ? cb_message_id : "none";
  var safe_cb = cb_id ? cb_id : "none";

  Bot.setProperty("pending_vote_context_" + voter_id, {
    gid: gid,
    target_uid: target_uid,
    voter_id: voter_id,
    cb_chat_id: safe_chat,
    cb_message_id: safe_mid,
    cb_id: safe_cb
  }, "json");
  Bot.setProperty("last_voter_id", voter_id, "integer");

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

answer("🎉 Vote recorded! Total: " + new_votes, false);

// Update button in channel
if (cb_chat_id && cb_message_id) {
  var new_markup = {
    inline_keyboard: [[
      { text: "Vote - " + new_votes, callback_data: "vote " + gid + " " + target_uid, style: "success" }
    ]]
  };
  Api.editMessageReplyMarkup({
    chat_id: cb_chat_id,
    message_id: parseInt(cb_message_id, 10),
    reply_markup: new_markup,
    on_error: "on_channel_post_error"
  });
}
