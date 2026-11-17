/*CMD
  command: on_channel_chat_info
  help: Callback when Api.getChat returns channel information - saves to connected list and notifies owner
  need_reply: false
CMD*/

var OWNER_ID = 8710308658;

function getPropJson(name, default_val) {
  var val = Bot.getProperty(name);
  if (!val) return default_val;
  if (typeof val === "object") return val;
  if (typeof val === "string") {
    try { return JSON.parse(val) || default_val; } catch (e) { return default_val; }
  }
  return default_val;
}

if (options && options.result) {
  var ch = options.result;
  var chat_key = String(ch.id);
  var channels = getPropJson("connected_channels", {});

  var is_new = !channels[chat_key] && (!ch.username || !channels["@" + ch.username.toLowerCase()]);

  var ch_data = {
    id: chat_key,
    title: ch.title || (ch.username ? ("@" + ch.username) : "Channel"),
    username: ch.username || "",
    type: ch.type || "channel",
    added_by: (user && user.first_name ? user.first_name : "Admin"),
    added_by_id: (user ? user.telegramid : OWNER_ID),
    added_at: new Date().toISOString()
  };

  channels[chat_key] = ch_data;
  if (ch.username) {
    channels["@" + ch.username.toLowerCase()] = ch_data;
  }
  Bot.setProperty("connected_channels", channels, "json");

  // Notify Owner if newly added/detected
  if (is_new) {
    var add_notify =
      "🔔 <b>CHANNEL CONNECTED TO BOT!</b> 🔔\n\n" +
      "📢 <b>Channel Title:</b> " + (ch.title || "Channel") + "\n" +
      "🆔 <b>Chat ID:</b> <code>" + ch.id + "</code>\n" +
      "🔗 <b>Username:</b> @" + (ch.username || "None") + "\n" +
      "📊 <b>Chat Type:</b> <code>" + (ch.type || "channel") + "</code>\n\n" +
      "👤 <b>Connected by:</b> " + (user && user.first_name ? user.first_name : "Admin") + "\n" +
      "🆔 <b>User ID:</b> <code>" + (user ? user.telegramid : OWNER_ID) + "</code>\n\n" +
      "✅ <i>Yeh channel Channel Control Suite me add ho gaya hai!</i>";

    Api.sendMessage({
      chat_id: OWNER_ID,
      text: add_notify,
      parse_mode: "HTML"
    });
  }
}
