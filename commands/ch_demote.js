/*CMD
  command: ch_demote
  help: Ask for user ID to demote from Admin
  need_reply: false
CMD*/

var OWNER_ID = 8710308658;
if (user.telegramid != OWNER_ID) {
  Bot.sendMessage("🚫 Access Denied.");
  return;
}

var target_chid = (params || User.getProperty("active_channel") || "").trim();
User.setProperty("active_channel", target_chid, "string");

var text = 
  "⬇️ <b>DEMOTE ADMIN TO MEMBER</b>\n\n" +
  "🆔 <b>Channel Chat ID:</b> <code>" + target_chid + "</code>\n\n" +
  "User ka <b>Telegram Numeric User ID</b> bhejo jisko Demote karna hai (Admin privileges hatani hain).\n\n" +
  "Cancel karne ke liye <code>cancel</code> likhein.";

var buttons = [
  [{ text: "🔙 Cancel", callback_data: "ch_view " + target_chid, style: "primary" }]
];

var target_chat = (chat && chat.chatid) ? chat.chatid : user.telegramid;

Api.sendMessage({
  chat_id: target_chat,
  text: text,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: buttons }
});

Bot.runCommand("step_ch_demote");
