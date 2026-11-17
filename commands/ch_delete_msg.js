/*CMD
  command: ch_delete_msg
  help: Ask for message ID to delete from channel
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
  "🗑 <b>DELETE CHANNEL MESSAGE</b>\n\n" +
  "🆔 <b>Channel Chat ID:</b> <code>" + target_chid + "</code>\n\n" +
  "Jo message delete karna hai uska <b>Message ID</b> bhejein (jaise <code>45</code> ya <code>128</code>).\n\n" +
  "<i>(Aap channel se wo message bot ko forward bhi kar sakte hain ya link paste kar sakte hain)</i>\n\n" +
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

Bot.runCommand("step_ch_delete_msg");
