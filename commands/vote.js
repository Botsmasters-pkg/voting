/*CMD
  command: vote
  help: Process voting action on participant card
  need_reply: false
CMD*/

var raw_params = (params || "").trim().split(" ");
if (raw_params.length < 2) {
  Bot.answerCallbackQuery({ message: "⚠️ Invalid vote parameters.", alert: true });
  return;
}

var gid = raw_params[0];
var participant_id = raw_params[1];
var voter_id = user.telegramid;

var banned_users = Bot.getProperty("banned_users", []);
if (banned_users.indexOf(voter_id) !== -1) {
  Bot.answerCallbackQuery({ message: "🚫 Aapko bot me ban kiya gaya hai. Aap vote nahi kar sakte.", alert: true });
  return;
}

var all_giveaways = Bot.getProperty("all_giveaways", {});
var giveaway = all_giveaways[gid];

if (!giveaway) {
  Bot.answerCallbackQuery({ message: "❌ Ye contest ab exist nahi karta.", alert: true });
  return;
}

if (giveaway.status !== "active") {
  Bot.answerCallbackQuery({ message: "🛑 Ye contest end ho chuka hai.", alert: true });
  return;
}

giveaway.vote_counts = giveaway.vote_counts || {};
giveaway.voted_users = giveaway.voted_users || {};
giveaway.voted_users[participant_id] = giveaway.voted_users[participant_id] || [];

var voters = giveaway.voted_users[participant_id];
if (voters.indexOf(voter_id) !== -1) {
  Bot.answerCallbackQuery({ message: "⚠️ Aap is participant ko pehle hi vote de chuke hain!", alert: true });
  return;
}

Api.getChatMember({
  chat_id: giveaway.channel,
  user_id: voter_id,
  on_result: "on_vote_member_check " + gid + " " + participant_id,
  on_error: "on_vote_member_error " + gid + " " + participant_id
});
