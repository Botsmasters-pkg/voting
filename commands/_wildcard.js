/*CMD
  command: *
  help: Catches callbacks, channel member updates, channel posts, and owner alerts
  need_reply: false
CMD*/

var OWNER_ID = 8710308658;

function getPropJson(name, default_val) {
  var val = Bot.getProperty(name);
  if (!val) return default_val;
  if (typeof val === "object") return val;
  if (typeof val === "string") {
    try { return JSON.parse(val) || default_val; } catch (e) { return default_val; }
  }
  return default_val;
}

// Automatically detect & cache bot username from token if not yet cached
if (!Bot.getProperty("bot_username")) {
  Api.getMe({
    result_to_bot_property: "bot_info",
    on_result: "on_save_bot_info"
  });
}

// Intercept Chat Join Requests (Instant verification support for request channels)
if (request && request.chat_join_request) {
  var cjr = request.chat_join_request;
  var req_uid = cjr.from ? cjr.from.id : null;
  var req_chat = cjr.chat ? cjr.chat.id : null;
  if (req_uid && req_chat) {
    Bot.setProperty("fsub_requested_" + req_chat + "_" + req_uid, true, "boolean");
  }
  return;
}

// 0. Handle Dynamic Callback Queries
if (request && request.callback_query && request.callback_query.data) {
  Api.answerCallbackQuery({
    callback_query_id: request.callback_query.id
  });
  var data = request.callback_query.data;

  if (data === "admin_fsub") {
    Bot.runCommand("admin_fsub");
    return;
  }
  if (data === "admin_fsub_list") {
    Bot.runCommand("admin_fsub_list");
    return;
  }
  if (data === "admin_fsub_toggle") {
    Bot.runCommand("admin_fsub_toggle");
    return;
  }
  if (data === "admin_fsub_remove") {
    Bot.runCommand("admin_fsub_remove");
    return;
  }
  if (data.indexOf("admin_fsub_remove ") === 0) {
    Bot.run({ command: "admin_fsub_remove", params: data.replace("admin_fsub_remove ", "") });
    return;
  }
  if (data.indexOf("admin_fsub_prompt ") === 0) {
    Bot.run({ command: "admin_fsub_prompt", params: data.replace("admin_fsub_prompt ", "") });
    return;
  }
  if (data === "fsub_verify") {
    Bot.runCommand("fsub_verify");
    return;
  }

  if (data === "go_back_home" || data === "cancel_creation") {
    Bot.runCommand("/start");
    return;
  }
  if (data === "create_giveaway") {
    Bot.runCommand("create_giveaway");
    return;
  }
  if (data === "admin_giveaways") {
    Bot.runCommand("admin_giveaways");
    return;
  }
  if (data === "my_giveaways") {
    Bot.runCommand("my_giveaways");
    return;
  }
  if (data === "my_stats") {
    Bot.runCommand("my_stats");
    return;
  }
  if (data === "how_it_works") {
    Bot.runCommand("how_it_works");
    return;
  }
  if (data.indexOf("manage_giveaway ") === 0) {
    Bot.run({ command: "manage_giveaway", params: data.replace("manage_giveaway ", "") });
    return;
  }
  if (data.indexOf("cmd_add_votes ") === 0) {
    Bot.run({ command: "cmd_add_votes", params: data.replace("cmd_add_votes ", "") });
    return;
  }
  if (data.indexOf("cmd_remove_votes ") === 0) {
    Bot.run({ command: "cmd_remove_votes", params: data.replace("cmd_remove_votes ", "") });
    return;
  }
  if (data.indexOf("cmd_leaderboard ") === 0) {
    Bot.run({ command: "cmd_leaderboard", params: data.replace("cmd_leaderboard ", "") });
    return;
  }
  if (data.indexOf("cmd_sync_giveaway ") === 0) {
    Bot.run({ command: "cmd_sync_giveaway", params: data.replace("cmd_sync_giveaway ", "") });
    return;
  }
  if (data.indexOf("cmd_end_giveaway ") === 0) {
    Bot.run({ command: "cmd_end_giveaway", params: data.replace("cmd_end_giveaway ", "") });
    return;
  }
  if (data.indexOf("step_giveaway_duration ") === 0) {
    Bot.run({ command: "step_giveaway_duration", params: data.replace("step_giveaway_duration ", "") });
    return;
  }

  if (data.indexOf("manage_") === 0 && data.indexOf("manage_giveaway") !== 0) {
    var mgid = data.replace("manage_", "");
    Bot.run({ command: "manage_giveaway", options: { giveaway_id: mgid } });
    return;
  }
  if (data.indexOf("addvotes_") === 0) {
    var agid = data.replace("addvotes_", "");
    Bot.run({ command: "cmd_add_votes", options: { giveaway_id: agid } });
    return;
  }
  if (data.indexOf("removevotes_") === 0) {
    var rgid = data.replace("removevotes_", "");
    Bot.run({ command: "cmd_remove_votes", options: { giveaway_id: rgid } });
    return;
  }
  if (data.indexOf("leaderboard_") === 0) {
    var lgid = data.replace("leaderboard_", "");
    Bot.run({ command: "cmd_leaderboard", options: { giveaway_id: lgid } });
    return;
  }
  if (data.indexOf("confirm_end_") === 0) {
    var cegid = data.replace("confirm_end_", "");
    Bot.run({ command: "cmd_end_giveaway", options: { giveaway_id: cegid, action: "confirm" } });
    return;
  }
  if (data.indexOf("endgiveaway_") === 0) {
    var egid = data.replace("endgiveaway_", "");
    Bot.run({ command: "cmd_end_giveaway", options: { giveaway_id: egid } });
    return;
  }
  if (data.indexOf("join_giveaway ") === 0) {
    Bot.run({ command: "join_giveaway", params: data.replace("join_giveaway ", "") });
    return;
  }
  if (data.indexOf("vote ") === 0) {
    Bot.run({ command: "vote", params: data.replace("vote ", "") });
    return;
  }
  if (data.indexOf("retry_join_") === 0) {
    var rjgid = data.replace("retry_join_", "");
    Bot.run({ command: "join_giveaway", options: { giveaway_id: rjgid, action: "retry" } });
    return;
  }
  if (data.indexOf("join_") === 0 && data.indexOf("join_giveaway") !== 0) {
    var jgid = data.replace("join_", "");
    Bot.run({ command: "join_giveaway", options: { giveaway_id: jgid, action: "join" } });
    return;
  }
  if (data.indexOf("vote_") === 0) {
    Bot.run({ command: "vote", options: { giveaway_id: data.replace("vote_", "") } });
    return;
  }
}

// 1. Telegram my_chat_member status changes (Bot added as Admin or removed)
if (request && request.my_chat_member) {
  var mcm = request.my_chat_member;
  var new_status = mcm.new_chat_member ? mcm.new_chat_member.status : "";
  var chat = mcm.chat || {};
  var from = mcm.from || {};
  var chat_key = String(chat.id);
  var channels = getPropJson("connected_channels", {});

  // Bot ADDED as Admin or Member
  if (new_status === "administrator" || new_status === "creator" || new_status === "member") {
    var ch_obj = {
      id: chat_key,
      title: chat.title || (chat.username ? ("@" + chat.username) : "Private Channel"),
      username: chat.username || "",
      type: chat.type || "channel",
      added_by: (from.first_name || "User") + (from.last_name ? (" " + from.last_name) : ""),
      added_by_id: from.id,
      added_by_username: from.username || "",
      added_at: new Date().toISOString()
    };
    channels[chat_key] = ch_obj;
    if (chat.username) {
      channels["@" + chat.username.toLowerCase()] = ch_obj;
    }
    Bot.setProperty("connected_channels", channels, "json");

    var add_notify = 
      "🔔 <b>BOT ADDED AS ADMIN IN A CHANNEL!</b> 🔔\n\n" +
      "📢 <b>Channel Title:</b> " + (chat.title || "Private Channel") + "\n" +
      "🆔 <b>Chat ID:</b> <code>" + chat.id + "</code>\n" +
      "🔗 <b>Username:</b> @" + (chat.username || "None") + "\n" +
      "📊 <b>Chat Type:</b> <code>" + (chat.type || "channel") + "</code>\n\n" +
      "👤 <b>Added by:</b> " + (from.first_name || "User") + (from.last_name ? (" " + from.last_name) : "") + "\n" +
      "🆔 <b>User ID:</b> <code>" + from.id + "</code>\n" +
      "📝 <b>Username:</b> @" + (from.username || "None") + "\n\n" +
      "⏰ <b>Time:</b> " + new Date().toLocaleString();

    Api.sendMessage({
      chat_id: OWNER_ID,
      text: add_notify,
      parse_mode: "HTML"
    });
  }

  // Bot REMOVED / KICKED from Channel
  if (new_status === "left" || new_status === "kicked") {
    var removed_title = chat.title || (channels[chat_key] ? channels[chat_key].title : "Channel");
    
    if (channels[chat_key]) {
      delete channels[chat_key];
    }
    if (chat.username && channels["@" + chat.username.toLowerCase()]) {
      delete channels["@" + chat.username.toLowerCase()];
    }
    Bot.setProperty("connected_channels", channels, "json");

    var remove_notify = 
      "🚨 <b>BOT REMOVED FROM CHANNEL!</b> 🚨\n\n" +
      "📢 <b>Channel:</b> " + removed_title + "\n" +
      "🆔 <b>Chat ID:</b> <code>" + chat.id + "</code>\n" +
      "🔗 <b>Username:</b> @" + (chat.username || "None") + "\n\n" +
      "👤 <b>Removed By:</b> " + (from.first_name || "User") + (from.last_name ? (" " + from.last_name) : "") + "\n" +
      "🆔 <b>User ID:</b> <code>" + from.id + "</code>\n" +
      "📝 <b>Username:</b> @" + (from.username || "None") + "\n\n" +
      "⚠️ <i>Yeh channel bot ki connected list se automatically hata diya gaya hai.</i>";

    Api.sendMessage({
      chat_id: OWNER_ID,
      text: remove_notify,
      parse_mode: "HTML"
    });
  }
}

// 2. Channel Posts Detection
if (request && request.channel_post && request.channel_post.chat) {
  var cp_chat = request.channel_post.chat;
  var cp_key = String(cp_chat.id);
  var cp_channels = getPropJson("connected_channels", {});
  if (!cp_channels[cp_key]) {
    var cp_obj = {
      id: cp_key,
      title: cp_chat.title || "Channel",
      username: cp_chat.username || "",
      type: cp_chat.type || "channel",
      added_by: "Channel Activity",
      added_by_id: null,
      added_at: new Date().toISOString()
    };
    cp_channels[cp_key] = cp_obj;
    if (cp_chat.username) {
      cp_channels["@" + cp_chat.username.toLowerCase()] = cp_obj;
    }
    Bot.setProperty("connected_channels", cp_channels, "json");
  }
}

// 3. User Text Message State Machine Dispatcher
if (user && message) {
  var msg_text = message.trim();

  // Cancel commands
  if (msg_text === "/cancel" || msg_text.toLowerCase() === "cancel") {
    User.setProperty("waiting_giveaway_channel", false, "boolean");
    User.setProperty("waiting_giveaway_title", false, "boolean");
    User.setProperty("waiting_fsub_chat_id", false, "boolean");
    User.setProperty("waiting_fsub_link", false, "boolean");
    Bot.setProperty("waiting_clone_email_" + user.telegramid, false, "boolean");
    Bot.sendMessage("❌ <i>Operation cancelled.</i>", { parse_mode: "HTML" });
    Bot.runCommand("/start");
    return;
  }

  // Clone email waiting
  var waiting_clone = Bot.getProperty("waiting_clone_email_" + user.telegramid);
  if (waiting_clone) {
    Bot.run({ command: "/41", options: { email: message } });
    return;
  }

  // Contest creation Step 1 (Channel)
  if (User.getProperty("waiting_giveaway_channel")) {
    Bot.run({ command: "step_giveaway_channel", options: { text: message } });
    return;
  }

  // Contest creation Step 2 (Title)
  if (User.getProperty("waiting_giveaway_title")) {
    Bot.run({ command: "step_giveaway_title", options: { text: message } });
    return;
  }

  // Force sub Step 1 (Chat ID)
  if (User.getProperty("waiting_fsub_chat_id")) {
    Bot.run({ command: "step_fsub_chat_id", options: { text: message } });
    return;
  }

  // Force sub Step 2 (Link)
  if (User.getProperty("waiting_fsub_link")) {
    Bot.run({ command: "step_fsub_link", options: { text: message } });
    return;
  }
}
