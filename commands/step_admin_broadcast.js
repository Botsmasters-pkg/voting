/*CMD
  command: step_admin_broadcast
  help: Execute broadcast to all registered users
  need_reply: true
CMD*/

var OWNER_ID = 8710308658;
if (user.telegramid != OWNER_ID) {
  Bot.sendMessage("🚫 Access Denied.");
  return;
}

var raw_msg = (options && options.text) ? options.text : message;

if (!raw_msg || raw_msg.toLowerCase() === "cancel" || raw_msg === "/start") {
  User.setProperty("waiting_admin_broadcast", false, "boolean");
  Bot.sendMessage("❌ Broadcast cancel kar diya gaya.");
  Bot.runCommand("/admin");
  return;
}

User.setProperty("waiting_admin_broadcast", false, "boolean");

var all_users = Bot.getProperty("all_users", []);
var broadcast_text = "📢 <b>BROADCAST ANNOUNCEMENT:</b>\n\n" + raw_msg;

Bot.sendMessage("⏳ Broadcast shuru ho raha hai... Total users: " + all_users.length);

var sent_count = 0;
for (var i = 0; i < all_users.length; i++) {
  var target_uid = all_users[i];
  try {
    Api.sendMessage({
      chat_id: target_uid,
      text: broadcast_text,
      parse_mode: "HTML"
    });
    sent_count++;
  } catch(e) {
  }
}

Bot.sendMessage("✅ <b>Broadcast Completed!</b>\n\nMessage bhej diya gaya: <code>" + sent_count + "</code> users ko.", { parse_mode: "HTML" });
Bot.runCommand("/admin");
