/*CMD
  command: on_ch_get_link_error
  help: Error callback when link creation fails
  need_reply: false
CMD*/

var target_chid = (params || User.getProperty("active_channel") || "").trim();

var text = 
  "⚠️ <b>Link Generate Nahi Ho Paya!</b>\n\n" +
  "🆔 <b>Chat ID:</b> <code>" + target_chid + "</code>\n\n" +
  "<b>Wajah:</b> Bot ke paas channel ka invite link create karne ki permission nahi hai.\n\n" +
  "<i>Check karein ki Bot channel me Admin hai aur 'Invite Users via Links' permission ON hai.</i>";

var buttons = [
  [{ text: "🔙 Back to Channel Panel", callback_data: "ch_view " + target_chid, style: "primary" }]
];

var target_chat = (chat && chat.chatid) ? chat.chatid : user.telegramid;

Api.sendMessage({
  chat_id: target_chat,
  text: text,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: buttons }
});
