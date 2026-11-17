/*CMD
  command: on_channel_post_success
  help: Callback when contest announcement is posted - auto saves channel to connected list
  need_reply: false
CMD*/

var OWNER_ID = 8710308658;

if (options && options.result && options.result.chat) {
  var chat = options.result.chat;
  var chat_key = String(chat.id);
  var channels = Bot.getProperty("connected_channels", {});

  var is_new = !channels[chat_key];

  var ch_data = {
    id: chat_key,
    title: chat.title || (chat.username ? ("@" + chat.username) : "Channel"),
    username: chat.username || "",
    type: chat.type || "channel",
    added_by: (user && user.first_name ? user.first_name : "Contest Creator"),
    added_by_id: (user ? user.telegramid : null),
    added_at: new Date().toISOString()
  };

  channels[chat_key] = ch_data;
  if (chat.username) {
    channels["@" + chat.username.toLowerCase()] = ch_data;
  }
  Bot.setProperty("connected_channels", channels, "json");

  if (is_new) {
    var add_notify = 
      "🔔 <b>CHANNEL AUTO-CONNECTED VIA CONTEST POST!</b> 🔔\n\n" +
      "📢 <b>Channel Title:</b> " + (chat.title || "Channel") + "\n" +
      "🆔 <b>Chat ID:</b> <code>" + chat.id + "</code>\n" +
      "🔗 <b>Username:</b> @" + (chat.username || "None") + "\n" +
      "📊 <b>Chat Type:</b> <code>" + (chat.type || "channel") + "</code>\n\n" +
      "👤 <b>Creator:</b> " + (user && user.first_name ? user.first_name : "Admin") + "\n" +
      "🆔 <b>User ID:</b> <code>" + (user ? user.telegramid : OWNER_ID) + "</code>\n\n" +
      "✅ <i>Yeh channel ab Channel Control Suite me automatically add ho gaya hai!</i>";

    Api.sendMessage({
      chat_id: OWNER_ID,
      text: add_notify,
      parse_mode: "HTML"
    });
  }
}
