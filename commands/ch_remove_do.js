/*CMD
  command: ch_remove_do
  help: Remove channel from connected list permanently
  need_reply: false
CMD*/

function answer(msg, alert) {
  var cb_id = (request && request.callback_query) ? request.callback_query.id : (request ? request.id : null);
  if (cb_id) {
    Api.answerCallbackQuery({
      callback_query_id: cb_id,
      text: msg || "",
      show_alert: !!alert
    });
  }
}

function getPropJson(name, default_val) {
  var val = Bot.getProperty(name);
  if (!val) return default_val;
  if (typeof val === "object") return val;
  if (typeof val === "string") {
    try { return JSON.parse(val) || default_val; } catch (e) { return default_val; }
  }
  return default_val;
}

var target_chid = (params || "").trim();
var channels = getPropJson("connected_channels", {});
var removed_channels = getPropJson("removed_channels", {});

var found_item = channels[target_chid];

// Mark in removed_channels blacklist so auto-sync never brings it back
removed_channels[target_chid] = true;
if (target_chid.startsWith("@")) {
  removed_channels[target_chid.toLowerCase()] = true;
}

// Delete by direct key
delete channels[target_chid];

if (found_item) {
  if (found_item.id) {
    delete channels[String(found_item.id)];
    removed_channels[String(found_item.id)] = true;
  }
  if (found_item.username) {
    delete channels["@" + String(found_item.username).toLowerCase()];
    removed_channels["@" + String(found_item.username).toLowerCase()] = true;
  }
}

for (var k in channels) {
  var ch = channels[k];
  if (ch && (ch.id === target_chid || (ch.username && "@" + ch.username.toLowerCase() === target_chid.toLowerCase()))) {
    delete channels[k];
  }
}

Bot.setProperty("connected_channels", channels, "json");
Bot.setProperty("removed_channels", removed_channels, "json");

answer("✅ Channel successfully removed!", false);

var target_chat = (chat && chat.chatid) ? chat.chatid : user.telegramid;
Api.sendMessage({
  chat_id: target_chat,
  text: "✅ Channel <code>" + target_chid + "</code> ko list se safaltapoorvak hata diya gaya hai.",
  parse_mode: "HTML"
});

Bot.runCommand("channel_tools");
