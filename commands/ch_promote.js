/*CMD
  command: ch_promote
  help: Ask for User ID to promote as Admin in channel
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
  "⬆️ <b>PROMOTE USER TO ADMIN</b>\n\n" +
  "🆔 <b>Channel Chat ID:</b> <code>" + target_chid + "</code>\n\n" +
  "User ka <b>Telegram Numeric User ID</b> bhejo jisko Admin banana hai.\n\n" +
  "<i>Example:</i> <code>1234567890</code>\n\n" +
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

Bot.runCommand("step_ch_promote");
