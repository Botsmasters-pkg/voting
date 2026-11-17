/*CMD
  command: ch_get_link
  help: Generate and export channel invite link
  need_reply: false
CMD*/

var active_channel = User.getProperty("active_channel");
if (!active_channel) {
  Bot.sendMessage("⚠️ Pehle koi channel select karein.");
  Bot.runCommand("channel_tools");
  return;
}

Bot.sendMessage("⏳ Channel link generate ho raha hai...");

Api.createChatInviteLink({
  chat_id: active_channel,
  name: "Bot Invite Link",
  on_result: "on_ch_get_link_result",
  on_error: "on_ch_get_link_error"
});\n