/*CMD
  command: channel_tools
  help: Display list of all connected channels for admin
  need_reply: false
CMD*/

var OWNER_ID = 8710308658;
if (user.telegramid != OWNER_ID) {
  Bot.sendMessage("🚫 <b>Access Denied:</b> Channel Control sirf Admin ke liye available hai.", { parse_mode: "HTML" });
  return;
}

var channels = Bot.getProperty("connected_channels", {});
var keys = Object.keys(channels);

var text = 
  "🎛 <b>CHANNEL ADMIN CONTROL SUITE</b> 🎛\n\n" +
  "Yahan se aap bot me connected sabhi channels ko manage kar sakte hain.\n\n";

var buttons = [];

if (keys.length === 0) {
  text += "⚠️ <i>Abhi koi bhi channel connected nahi hai.</i>\n\n" +
          "Bot ko channel me <b>Admin</b> banayein ya neeche <b>➕ Add Channel</b> se manually connect karein.";
} else {
  text += "📋 <b>Connected Channels (" + keys.length + "):</b>\n" +
          "<i>Kisi bhi channel par click karein uski Chat ID, Invite Link, Promote/Demote, aur Delete Message access karne ke liye 👇</i>";
  
  for (var i = 0; i < keys.length; i++) {
    var ch = channels[keys[i]];
    var label = "📢 " + ch.title + (ch.username ? (" (@" + ch.username + ")") : "");
    buttons.push([
      { text: label, callback_data: "ch_view " + ch.id, style: "primary" }
    ]);
  }
}

buttons.push([
  { text: "➕ Add Channel Manually", callback_data: "ch_select_prompt", style: "success" }
]);

buttons.push([
  { text: "🔙 Back to Admin Panel", callback_data: "/admin", style: "primary" }
]);

var target_chat = (chat && chat.chatid) ? chat.chatid : user.telegramid;

if (request && request.callback_query && request.callback_query.message) {
  Api.editMessageText({
    chat_id: request.callback_query.message.chat.id,
    message_id: request.callback_query.message.message_id,
    text: text,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: buttons }
  });
} else {
  Api.sendMessage({
    chat_id: target_chat,
    text: text,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: buttons }
  });
}
