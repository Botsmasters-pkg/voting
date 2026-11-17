/*CMD
  command: on_admin_detect_bot
  help: Handles admin refresh and notifies with detected bot username
  need_reply: false
CMD*/

var uname = null;
if (options && options.result && options.result.username) {
  uname = options.result.username;
} else if (options && options.username) {
  uname = options.username;
} else {
  var bInfo = Bot.getProperty("bot_info");
  if (bInfo) {
    if (bInfo.result && bInfo.result.username) uname = bInfo.result.username;
    else if (bInfo.username) uname = bInfo.username;
  }
}

if (uname) {
  var clean_name = uname.replace("@", "");
  Bot.setProperty("bot_username", clean_name, "string");
  Bot.sendMessage("✅ <b>Bot Token Detected Successfully!</b>\n\n🤖 <b>Active Telegram Bot:</b> @" + clean_name, { parse_mode: "HTML" });
} else {
  Bot.sendMessage("⚠️ <b>Could not detect bot username.</b> Kripya Bots.Business me bot token check karein.", { parse_mode: "HTML" });
}

Bot.runCommand("/admin");
