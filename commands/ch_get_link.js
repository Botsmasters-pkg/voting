/*CMD
  command: ch_get_link
  help: Generate and export channel invite link
  need_reply: false
CMD*/

var OWNER_ID = 8710308658;
if (user.telegramid != OWNER_ID) {
  Bot.sendMessage("🚫 Access Denied.");
  return;
}

var target_chid = (params || User.getProperty("active_channel") || "").trim();
if (!target_chid) {
  Bot.sendMessage("⚠️ Koi channel select nahi hai.");
  Bot.runCommand("channel_tools");
  return;
}

Bot.sendMessage("⏳ <code>" + target_chid + "</code> ka Invite Link generate ho raha hai...", { parse_mode: "HTML" });

Api.createChatInviteLink({
  chat_id: target_chid,
  name: "Toxic Admin Invite Link",
  on_result: "on_ch_get_link_result " + target_chid,
  on_error: "on_ch_get_link_error " + target_chid
});
