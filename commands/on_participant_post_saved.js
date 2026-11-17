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

var p_latest = getPropJson("pending_post_saved_latest", null);
if (p_latest && p_latest.gid) {
  if (!gid) gid = p_latest.gid;
  if (!participant_uid) participant_uid = p_latest.uid;
}

if (!gid && user) {
  var p = getPropJson("pending_post_saved_" + user.telegramid, null);
  if (p) {
    if (!gid) gid = p.gid;
    if (!participant_uid) participant_uid = p.uid;
  }
}

var res = (options && options.result) ? options.result : (options || {});
var msg_id = res.message_id ? parseInt(res.message_id, 10) : null;
var chat_id = (res.chat && res.chat.id) ? res.chat.id : null;

// Fallback: Extract gid and participant_uid directly from callback_data or message text
if ((!gid || !participant_uid) && res) {
  try {
    if (res.reply_markup && res.reply_markup.inline_keyboard && res.reply_markup.inline_keyboard[0]) {
      var cb = res.reply_markup.inline_keyboard[0][0].callback_data;
      if (cb && cb.indexOf("vote ") === 0) {
        var parts = cb.replace("vote ", "").trim().split(/\s+/);
        if (!gid) gid = parts[0];
        if (!participant_uid) participant_uid = parts[1];
      }
    }
    if (res.text) {
      if (!gid) {
        var gid_m = res.text.match(/Contest ID:\s*#?([A-Za-z0-9_-]+)/i) || res.text.match(/Contest:\s*#?([A-Za-z0-9_-]+)/i);
        if (gid_m) gid = gid_m[1];
      }
      if (!participant_uid) {
        var id_m = res.text.match(/ID:\s*<code>?(\d+)<?/i) || res.text.match(/ID:\s*(\d+)/i);
        if (id_m) participant_uid = id_m[1];
      }
    }
  } catch (e) {}
}

if (!gid && participant_uid) {
  var temp_all = getPropJson("all_giveaways", {});
  for (var g_k in temp_all) {
    var gw = temp_all[g_k];
    if (gw && !gw.ended && gw.status !== "ended" && gw.users && (gw.users[participant_uid] || gw.users[String(participant_uid)])) {
      gid = g_k;
      break;
    }
  }
}

if (msg_id && gid && participant_uid) {
  var all_giveaways = getPropJson("all_giveaways", {});
  var giveaway = all_giveaways[gid];
  if (giveaway) {
    giveaway.vote_messages = giveaway.vote_messages || {};
    giveaway.vote_messages[participant_uid] = msg_id;
    giveaway.vote_messages[String(participant_uid)] = msg_id;
    giveaway.vote_messages[Number(participant_uid)] = msg_id;
    if (chat_id) {
      giveaway.channel_chat_id = chat_id;
    }
    all_giveaways[gid] = giveaway;
    Bot.setProperty("all_giveaways", all_giveaways, "json");

    // If votes already exist (e.g. admin added votes or queued), sync channel button immediately!
    var current_v = (giveaway.vote_counts && giveaway.vote_counts[participant_uid]) ? giveaway.vote_counts[participant_uid] : 0;
    if (current_v > 0 && (chat_id || giveaway.channel)) {
      Api.editMessageReplyMarkup({
        chat_id: chat_id || giveaway.channel,
        message_id: msg_id,
        reply_markup: {
          inline_keyboard: [[
            { text: "Vote - " + current_v, callback_data: "vote " + gid + " " + participant_uid, style: "success" }
          ]]
        },
        on_error: "on_channel_post_error"
      });
    }
  }
}

// Forward to on_channel_post_success to ensure channel auto-connection continues
Bot.run({
  command: "on_channel_post_success",
  options: options
});
