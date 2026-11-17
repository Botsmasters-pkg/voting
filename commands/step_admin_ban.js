/*CMD
  command: step_admin_ban
  help: Process user ban or unban action
  need_reply: true
CMD*/

var OWNER_ID = 8710308658;
if (user.telegramid != OWNER_ID) {
  Bot.sendMessage("🚫 Access Denied.");
  return;
}

var raw_msg = (options && options.text) ? options.text : message;

if (!raw_msg || raw_msg.toLowerCase() === "cancel" || raw_msg === "/start") {
  User.setProperty("waiting_admin_ban", false, "boolean");
  Bot.sendMessage("❌ Cancelled.");
  Bot.runCommand("/admin");
  return;
}

User.setProperty("waiting_admin_ban", false, "boolean");

var target_id = parseInt(raw_msg.trim());
if (isNaN(target_id)) {
  Bot.sendMessage("⚠️ Kripya valid numeric User ID dalein.");
  Bot.runCommand("step_admin_ban");
  return;
}

var banned_users = Bot.getProperty("banned_users", []);
var idx = banned_users.indexOf(target_id);

if (idx !== -1) {
  banned_users.splice(idx, 1);
  Bot.setProperty("banned_users", banned_users, "json");
  Bot.sendMessage("✅ User <code>" + target_id + "</code> ko <b>UNBANNED</b> kar diya gaya hai.", { parse_mode: "HTML" });
} else {
  banned_users.push(target_id);
  Bot.setProperty("banned_users", banned_users, "json");
  Bot.sendMessage("🚫 User <code>" + target_id + "</code> ko <b>BANNED</b> kar diya gaya hai.", { parse_mode: "HTML" });
}

Bot.runCommand("/admin");
