/*CMD
  command: step_ch_promote
  help: Execute promoteChatMember API call
  need_reply: true
CMD*/

var active_channel = User.getProperty("active_channel");

if (!message || message.toLowerCase() === "cancel" || message === "/start") {
  Bot.sendMessage("❌ Promotion cancel kiya gaya.");
  Bot.runCommand("ch_panel");
  return;
}

var target_uid = parseInt(message.trim());
if (isNaN(target_uid)) {
  Bot.sendMessage("⚠️ Kripya valid numeric User ID bhejein (jaise 1234567890).");
  Bot.runCommand("step_ch_promote");
  return;
}

Bot.sendMessage("⏳ Promoting User <code>" + target_uid + "</code> in channel...", { parse_mode: "HTML" });

Api.promoteChatMember({
  chat_id: active_channel,
  user_id: target_uid,
  can_manage_chat: true,
  can_post_messages: true,
  can_edit_messages: true,
  can_delete_messages: true,
  can_invite_users: true,
  can_restrict_members: true,
  can_pin_messages: true,
  can_promote_members: false,
  on_result: "on_ch_promote_result " + target_uid,
  on_error: "on_ch_promote_error " + target_uid
});
