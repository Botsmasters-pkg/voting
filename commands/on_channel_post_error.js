/*CMD
  command: on_channel_post_error
  help: Callback when contest announcement post fails
  need_reply: false
CMD*/

var err = options && options.error ? options.error : "Unknown error";
var err_str = JSON.stringify(err);

// Silently ignore benign Telegram error if button markup is already identical
if (err_str.indexOf("message is not modified") !== -1 || err_str.indexOf("MESSAGE_NOT_MODIFIED") !== -1) {
  return;
}

Bot.sendMessage("⚠️ <b>Warning:</b> Bot channel me message post/update nahi kar paya.\n\n<i>Check karein ki bot channel me added hai aur Post/Edit Messages ki permission hai.</i>\n\nDetail: " + err_str, { parse_mode: "HTML" });
