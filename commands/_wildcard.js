/*CMD
  command: *
  help: Catches Telegram updates, detects bot info, and notifies owner when bot is made admin
  need_reply: false
CMD*/

var OWNER_ID = 8710308658;

// Auto detect bot username if not cached yet
if (!Bot.getProperty("bot_username")) {
  Api.getMe({ on_result: "on_save_bot_info" });
}

// Check if bot was added as admin in any channel or group
if (request && request.my_chat_member) {
  var mcm = request.my_chat_member;
  var new_status = mcm.new_chat_member ? mcm.new_chat_member.status : "";
  
  if (new_status === "administrator") {
    var chat = mcm.chat || {};
    var from = mcm.from || {};
    
    var notify_text = 
      "🔔 <b>BOT ADDED AS ADMIN IN A CHANNEL!</b> 🔔\n\n" +
      "📢 <b>Channel Title:</b> " + (chat.title || "Private Channel") + "\n" +
      "🆔 <b>Channel ID:</b> <code>" + chat.id + "</code>\n" +
      "🔗 <b>Username:</b> @" + (chat.username || "None") + "\n" +
      "📊 <b>Chat Type:</b> <code>" + (chat.type || "channel") + "</code>\n\n" +
      "👤 <b>Added / Promoted by:</b> " + (from.first_name || "User") + (from.last_name ? (" " + from.last_name) : "") + "\n" +
      "🆔 <b>Admin User ID:</b> <code>" + from.id + "</code>\n" +
      "📝 <b>Admin Username:</b> @" + (from.username || "None") + "\n\n" +
      "⏰ <b>Time:</b> " + new Date().toLocaleString();

    Api.sendMessage({
      chat_id: OWNER_ID,
      text: notify_text,
      parse_mode: "HTML"
    });
  }
}
