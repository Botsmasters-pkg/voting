/*CMD
  command: admin_ban
  help: Ask for User ID to ban or unban
  need_reply: false
CMD*/

var OWNER_ID = 8710308658;
if (user.telegramid != OWNER_ID) {
  Bot.sendMessage("🚫 Access Denied.");
  return;
}

var banned_users = Bot.getProperty("banned_users", []);

var text = 
  "🚫 <b>USER BAN / UNBAN MANAGER</b>\n\n" +
  "Abhi total banned users: <code>" + banned_users.length + "</code>\n\n" +
  "User ka Telegram Numeric ID bhejo jisko Ban ya Unban karna hai.\n" +
  "<i>(Agar user pehle se banned hoga to Unban ho jayega, warna Ban ho jayega)</i>\n\n" +
  "Cancel karne ke liye <code>cancel</code> type karein.";

Bot.sendMessage(text, { parse_mode: "HTML" });
Bot.runCommand("step_admin_ban");
