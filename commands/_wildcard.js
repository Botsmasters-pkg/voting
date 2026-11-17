/*CMD
  command: *
  help: Catches channel member updates, channel posts, adds/removes channels, and sends live owner alerts
  need_reply: false
CMD*/

var OWNER_ID = 8710308658;

// Automatically detect & cache bot username from token if not yet cached
if (!Bot.getProperty("bot_username")) {
  Api.getMe({
    result_to_bot_property: "bot_info",
    on_result: "on_save_bot_info"
  });
}

// 1. Telegram my_chat_member status changes (Bot added as Admin or removed)
if (request && request.my_chat_member) {
  var mcm = request.my_chat_member;
  var new_status = mcm.new_chat_member ? mcm.new_chat_member.status : "";
  var chat = mcm.chat || {};
  var from = mcm.from || {};
  var chat_key = String(chat.id);
  var channels = Bot.getProperty("connected_channels", {});

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
    
    // Remove from connected list so it does NOT show in channel list
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

// 2. Channel Posts Detection (When bot is admin in channel and posts are published)
if (request && request.channel_post && request.channel_post.chat) {
  var cp_chat = request.channel_post.chat;
  var cp_key = String(cp_chat.id);
  var cp_channels = Bot.getProperty("connected_channels", {});
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

// 3. Check waiting clone email state
if (user && message) {
  var waiting_clone = Bot.getProperty("waiting_clone_email_" + user.telegramid);
  if (waiting_clone) {
    Bot.run({ command: "/41", options: { email: message } });
    return;
  }
}
