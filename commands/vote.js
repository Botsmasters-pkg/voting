/*CMD
  command: vote
  help: Process voting action on participant card
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

var raw_params = (params || "").trim().split(" ");
if (raw_params.length < 2) {
  answer("⚠️ Invalid vote parameters.", true);
  return;
}

var gid = raw_params[0];
var participant_id = raw_params[1];
var voter_id = user.telegramid;

var banned_users = getPropJson("banned_users", []);
if (banned_users.indexOf(voter_id) !== -1) {
  answer("🚫 Aapko bot me ban kiya gaya hai. Aap vote nahi kar sakte.", true);
  return;
}

var all_giveaways = getPropJson("all_giveaways", {});
var giveaway = all_giveaways[gid];

if (!giveaway) {
  answer("❌ Ye contest ab exist nahi karta.", true);
  return;
}

if (giveaway.status !== "active") {
  answer("🛑 Ye contest end ho chuka hai.", true);
  return;
}

giveaway.vote_counts = giveaway.vote_counts || {};
giveaway.voted_users = giveaway.voted_users || {};
giveaway.voted_users[participant_id] = giveaway.voted_users[participant_id] || [];

var voters = giveaway.voted_users[participant_id];
if (voters.indexOf(voter_id) !== -1) {
  answer("⚠️ Aap is participant ko pehle hi vote de chuke hain!", true);
  return;
}

// Check channel membership before counting vote
Api.getChatMember({
  chat_id: giveaway.channel,
  user_id: voter_id,
  on_result: "on_vote_member_check " + gid + " " + participant_id,
  on_error: "on_vote_member_error " + gid + " " + participant_id
});
