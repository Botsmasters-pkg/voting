/*CMD
  command: on_vote_member_check
  help: Callback after verifying channel membership for vote with real-time channel button update
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

var member = options && options.result ? options.result : null;
var status = member ? member.status : "";

var raw_params = (params || "").trim().split(/\s+/);
var gid = raw_params[0];
var participant_id = raw_params[1];
var voter_id = raw_params[2];
var cb_chat_id = (raw_params[3] && raw_params[3] !== "none") ? raw_params[3] : null;
var cb_message_id = (raw_params[4] && raw_params[4] !== "none") ? raw_params[4] : null;
var cb_id = (raw_params[5] && raw_params[5] !== "none") ? raw_params[5] : null;

if (!voter_id && user) {
  voter_id = user.telegramid;
}

if (!gid || !participant_id) {
  var pctx = voter_id ? getPropJson("pending_vote_context_" + voter_id, null) : null;
  if (pctx) {
    gid = pctx.gid;
    participant_id = pctx.target_uid;
    if (!voter_id) voter_id = pctx.voter_id;
    if (!cb_chat_id) cb_chat_id = (pctx.cb_chat_id !== "none") ? pctx.cb_chat_id : null;
    if (!cb_message_id) cb_message_id = (pctx.cb_message_id !== "none") ? pctx.cb_message_id : null;
    if (!cb_id) cb_id = (pctx.cb_id !== "none") ? pctx.cb_id : null;
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

var is_member = (status === "creator" || status === "administrator" || status === "member" || (status === "restricted" && member.is_member));

// If user is NOT a channel member, enforce membership requirement with frictionless 1-tap buttons
if (!is_member) {
  answerCb("⚠️ Vote count karane ke liye pehle channel join karein!", true);

  if (voter_id) {
    var ch_raw = giveaway.channel || "";
    var ch_link = ch_raw.startsWith("@") ? ("https://t.me/" + ch_raw.replace("@", "")) : ("https://t.me/" + Bot.getProperty("bot_username", "bot") + "?startchannel=true");

    var join_prompt_text = 
      "⚠️ <b>CHANNEL JOIN KARNA ZAROORI HAI!</b> ⚠️\n\n" +
      "Aapka vote tabhi count hoga jab aap pehle contest channel join karenge.\n\n" +
      "👉 <b>Step 1:</b> Neeche diye gaye <b>📢 Step 1: Join Channel</b> button par click karke channel join karein.\n" +
      "👉 <b>Step 2:</b> Join karne ke baad turant <b>🗳 Step 2: Cast Vote Now</b> button dabayein!\n\n" +
      "✨ <i>Ek baar vote record ho gaya, uske baad agar aap channel chhodte bhi hain to bhi aapka vote safe rahega!</i>";

    var prompt_buttons = [
      [{ text: "📢 Step 1: Join Channel", url: ch_link, style: "primary" }],
      [{ text: "🗳 Step 2: Cast Vote Now", callback_data: "vote " + gid + " " + participant_id, style: "success" }]
    ];

    Api.sendMessage({
      chat_id: voter_id,
      text: join_prompt_text,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: prompt_buttons }
    });
  }
  return;
}

// User IS a member - Record vote!
giveaway.vote_counts = giveaway.vote_counts || {};
giveaway.vote_records = giveaway.vote_records || {};
giveaway.voted_users = giveaway.voted_users || {};
giveaway.voted_users[participant_id] = giveaway.voted_users[participant_id] || [];

var vote_key = voter_id + "_" + participant_id;
if (giveaway.vote_records[vote_key] || giveaway.voted_users[participant_id].indexOf(voter_id) !== -1) {
  answerCb("⚠️ Aap pehle hi vote de chuke hain!", true);
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

var total_votes_all = Bot.getProperty("total_votes_count", 0);
Bot.setProperty("total_votes_count", total_votes_all + 1, "integer");

all_giveaways[gid] = giveaway;
Bot.setProperty("all_giveaways", all_giveaways, "json");

var votes_given = User.getProperty("votes_given", 0);
User.setProperty("votes_given", votes_given + 1, "integer");

// UPDATE BUTTON IN CHANNEL IN REAL-TIME
var target_channel = cb_chat_id || giveaway.channel_chat_id || giveaway.channel;
var target_mid = cb_message_id || giveaway.vote_messages[participant_id] || giveaway.vote_messages[String(participant_id)];

if (target_channel && target_mid) {
  var updated_button = [
    [
      { text: "Vote - " + current_votes, callback_data: "vote " + gid + " " + participant_id, style: "success" }
    ]
  ];

  Api.editMessageReplyMarkup({
    chat_id: target_channel,
    message_id: target_mid,
    reply_markup: { inline_keyboard: updated_button },
    on_error: "on_channel_post_error"
  });
}

answerCb("🎉 Vote recorded! Total: " + current_votes, false);
