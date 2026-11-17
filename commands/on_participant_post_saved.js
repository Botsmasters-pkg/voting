/*CMD
  command: on_participant_post_saved
  help: Callback when participant card is posted in channel - saves message_id so Add/Remove votes updates the channel button
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

var gid = null;
var participant_uid = null;

if (options && options.bb_options) {
  gid = options.bb_options.gid;
  participant_uid = options.bb_options.uid;
}

if (!gid && params) {
  var raw_params = (params || "").trim().split(/\s+/);
  gid = raw_params[0];
  participant_uid = raw_params[1];
}

if (!gid && user) {
  var p = getPropJson("pending_post_saved_" + user.telegramid, null);
  if (p) {
    gid = p.gid;
    participant_uid = p.uid;
  }
}

// Fallback: Extract gid and participant_uid directly from the Telegram message button callback_data
if ((!gid || !participant_uid) && options && options.result && options.result.reply_markup && options.result.reply_markup.inline_keyboard) {
  try {
    var cb = options.result.reply_markup.inline_keyboard[0][0].callback_data;
    if (cb && cb.indexOf("vote ") === 0) {
      var parts = cb.replace("vote ", "").trim().split(/\s+/);
      gid = parts[0];
      participant_uid = parts[1];
    }
  } catch (e) {}
}

if (options && options.result && options.result.message_id && gid && participant_uid) {
  var all_giveaways = getPropJson("all_giveaways", {});
  var giveaway = all_giveaways[gid];
  if (giveaway) {
    giveaway.vote_messages = giveaway.vote_messages || {};
    giveaway.vote_messages[participant_uid] = options.result.message_id;
    giveaway.vote_messages[String(participant_uid)] = options.result.message_id;
    if (options.result.chat && options.result.chat.id) {
      giveaway.channel_chat_id = options.result.chat.id;
    }
    all_giveaways[gid] = giveaway;
    Bot.setProperty("all_giveaways", all_giveaways, "json");
  }
}

// Forward to on_channel_post_success to ensure channel auto-connection continues
Bot.run({
  command: "on_channel_post_success",
  options: options
});
