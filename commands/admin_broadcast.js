/*CMD
  command: admin_broadcast
  help: Ask for broadcast message text
  need_reply: false
CMD*/

var OWNER_ID = 8710308658;
if (user.telegramid != OWNER_ID) {
  Bot.sendMessage("🚫 Access Denied.");
  return;
}

var text = 
  "📢 <b>ADMIN BROADCAST</b>\n\n" +
  "Sabhi users ko bhejne ke liye message type karein.\n\n" +
  "<i>(HTML tags jaise <b>bold</b>, <i>italic</i>, <code>code</code> supported hain)</i>\n\n" +
  "Ya cancel karne ke liye <code>cancel</code> type karein.";

Bot.sendMessage(text, { parse_mode: "HTML" });
Bot.runCommand("step_admin_broadcast");\n