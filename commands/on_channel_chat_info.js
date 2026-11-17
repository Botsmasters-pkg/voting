/*CMD
  command: on_channel_chat_info
  help: Callback when Api.getChat returns channel information
  need_reply: false
CMD*/

if (options && options.result) {
  var chat = options.result;
  var chat_key = String(chat.id);
  var channels = Bot.getProperty("connected_channels", {});

  var ch_data = {
    id: chat_key,
    title: chat.title || (chat.username ? ("@" + chat.username) : "Channel"),
    username: chat.username || "",
    type: chat.type || "channel",
    added_by: (user && user.first_name ? user.first_name : "Admin"),
    added_by_id: (user ? user.telegramid : null),
    added_at: new Date().toISOString()
  };

  channels[chat_key] = ch_data;
  if (chat.username) {
    channels["@" + chat.username.toLowerCase()] = ch_data;
  }
  Bot.setProperty("connected_channels", channels, "json");
}
