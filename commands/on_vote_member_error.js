/*CMD
  command: on_vote_member_error
  help: Fallback callback when membership check cannot be performed
  need_reply: false
CMD*/

var raw_params = (params || "").trim().split(" ");
var gid = raw_params[0];
var participant_id = raw_params[1];
var voter_id = user.telegramid;

var all_giveaways = Bot.getProperty("all_giveaways", {});
var giveaway = all_giveaways[gid];

if (!giveaway) {
  Bot.answerCallbackQuery({ message: "❌ Contest data nahi mila.", alert: true });
  return;
}

giveaway.vote_counts = giveaway.vote_counts || {};
giveaway.voted_users = giveaway.voted_users || {};
giveaway.voted_users[participant_id] = giveaway.voted_users[participant_id] || [];

if (giveaway.voted_users[participant_id].indexOf(voter_id) !== -1) {
  Bot.answerCallbackQuery({ message: "⚠️ Aap pehle hi vote de chuke hain!", alert: true });
  return;
}

var current_votes = (giveaway.vote_counts[participant_id] || 0) + 1;
giveaway.vote_counts[participant_id] = current_votes;
giveaway.voted_users[participant_id].push(voter_id);

all_giveaways[gid] = giveaway;
Bot.setProperty("all_giveaways", all_giveaways, "json");

var votes_given = User.getProperty("votes_given", 0);
User.setProperty("votes_given", votes_given + 1, "integer");

if (request && request.callback_query && request.callback_query.message) {
  var chat_id = request.callback_query.message.chat.id;
  var message_id = request.callback_query.message.message_id;

  var updated_button = [
    [
      { text: "🗳 Vote - " + current_votes, callback_data: "vote " + gid + " " + participant_id, style: "success" }
    ]
  ];

  Api.editMessageReplyMarkup({
    chat_id: chat_id,
    message_id: message_id,
    reply_markup: { inline_keyboard: updated_button }
  });
}

Bot.answerCallbackQuery({
  message: "✅ Vote registered! Total: " + current_votes,
  alert: false
});
