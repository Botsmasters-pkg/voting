/*CMD
  command: on_ch_get_link_result
  help: Display generated channel invite link
  need_reply: false
CMD*/

var target_chid = (params || User.getProperty("active_channel") || "").trim();
var link = options && options.result ? options.result.invite_link : null;

if (!link) {
  Bot.sendMessage("⚠️ Link generate nahi ho paya.");
  return;
}

var text = 
  "🔗 <b>CHANNEL INVITE LINK GENERATED!</b> 🔗\n\n" +
  "🆔 <b>Chat ID:</b> <code>" + target_chid + "</code>\n\n" +
  "👉 <b>Invite Link:</b>\n" +
  "<code>" + link + "</code>\n\n" +
  "<i>Aap is link ko copy karke share kar sakte hain!</i>";

var buttons = [
  [
    { text: "🔗 Open Link", url: link, style: "success" }
  ],
  [
    { text: "🔙 Back to Channel Panel", callback_data: "ch_view " + target_chid, style: "primary" }
  ]
];

var target_chat = (chat && chat.chatid) ? chat.chatid : user.telegramid;

Api.sendMessage({
  chat_id: target_chat,
  text: text,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: buttons }
});
