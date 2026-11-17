/*CMD
  command: *
  help: Catches channel member updates, adds/removes channels, and sends live owner alerts
  need_reply: false
CMD*/

var OWNER_ID = 8710308658;

if (!Bot.getProperty("bot_username")) {
  Api.getMe({ on_result: "on_save_bot_info" });
}

if (request && request.my_chat_member) {
  var mcm = request.my_chat_member;
  var new_status = mcm.new_chat_member ? mcm.new_chat_member.status : "";
  var chat = mcm.chat || {};
  var from = mcm.from || {};
  var chat_key = String(chat.id);
  var channels = Bot.getProperty("connected_channels", {});

  // 1. Bot ADDED as Admin
  if (new_status === "administrator") {
    channels[chat_key] = {
      id: chat_key,
      title: chat.title || "Private Channel",
      username: chat.username || "",
      type: chat.type || "channel",
      added_by: (from.first_name || "User") + (from.last_name ? (" " + from.last_name) : ""),
      added_by_id: from.id,
      added_by_username: from.username || "",
      added_at: new Date().toISOString()
    };
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

  // 2. Bot REMOVED / KICKED from Channel
  if (new_status === "left" || new_status === "kicked") {
    var removed_title = chat.title || (channels[chat_key] ? channels[chat_key].title : "Channel");
    
    // Remove from connected list so it does NOT show in channel list
    if (channels[chat_key]) {
      delete channels[chat_key];
      Bot.setProperty("connected_channels", channels, "json");
    }

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
