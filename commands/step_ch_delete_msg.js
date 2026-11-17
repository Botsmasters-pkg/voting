/*CMD
  command: step_ch_delete_msg
  help: Execute deleteMessage in channel
  need_reply: true
CMD*/

var active_channel = User.getProperty("active_channel");

if (!message || message.toLowerCase() === "cancel" || message === "/start") {
  Bot.sendMessage("❌ Cancelled.");
  Bot.runCommand("ch_view " + active_channel);
  return;
}

var target_mid = null;
if (request && request.message && request.message.forward_from_message_id) {
  target_mid = request.message.forward_from_message_id;
} else {
  if (message.indexOf("/") !== -1) {
    var parts = message.trim().split("/");
    target_mid = parseInt(parts[parts.length - 1]);
  } else {
    target_mid = parseInt(message.trim());
  }
}

if (!target_mid || isNaN(target_mid)) {
  Bot.sendMessage("⚠️ Kripya valid numeric Message ID bhejein (jaise 45).");
  Bot.runCommand("step_ch_delete_msg");
  return;
}

Bot.sendMessage("⏳ Deleting Message <code>" + target_mid + "</code> from channel...", { parse_mode: "HTML" });

Api.deleteMessage({
  chat_id: active_channel,
  message_id: target_mid,
  on_result: "on_ch_delete_msg_result " + target_mid,
  on_error: "on_ch_delete_msg_error " + target_mid
});
