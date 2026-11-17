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

var notify_chats = [8710308658, 8805712913];
if (user && user.telegramid && notify_chats.indexOf(user.telegramid) === -1) {
  notify_chats.push(user.telegramid);
}

for (var i = 0; i < notify_chats.length; i++) {
  Api.sendMessage({
    chat_id: notify_chats[i],
    text: "⚠️ <b>Channel Post/Edit Error:</b>\n\nDetail: <code>" + err_str + "</code>\n\n<i>Tip: Bot ko channel me <b>Edit Messages of Others</b> admin permission zaroor dein!</i>",
    parse_mode: "HTML"
  });
}
