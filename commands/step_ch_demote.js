/*CMD
  command: step_ch_demote
  help: Execute demote (remove admin rights) via promoteChatMember
  need_reply: true
CMD*/

var active_channel = User.getProperty("active_channel");

if (!message || message.toLowerCase() === "cancel" || message === "/start") {
  Bot.sendMessage("❌ Demotion cancel kiya gaya.");
  Bot.runCommand("ch_panel");
  return;
}

var target_uid = parseInt(message.trim());
if (isNaN(target_uid)) {
  Bot.sendMessage("⚠️ Kripya valid numeric User ID dalein.");
  Bot.runCommand("step_ch_demote");
  return;
}

Bot.sendMessage("⏳ Demoting User <code>" + target_uid + "</code>...", { parse_mode: "HTML" });

Api.promoteChatMember({
  chat_id: active_channel,
  user_id: target_uid,
  can_manage_chat: false,
  can_post_messages: false,
  can_edit_messages: false,
  can_delete_messages: false,
  can_invite_users: false,
  can_restrict_members: false,
  can_pin_messages: false,
  can_promote_members: false,
  on_result: "on_ch_demote_result " + target_uid,
  on_error: "on_ch_demote_error " + target_uid
});
