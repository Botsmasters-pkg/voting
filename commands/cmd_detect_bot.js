/*CMD
  command: cmd_detect_bot
  help: Trigger getMe to refresh bot username from token
  need_reply: false
CMD*/

Api.getMe({
  on_result: "on_save_bot_info"
});
Bot.sendMessage("🔄 Token ke anusaar Bot Username re-detect ho raha hai...");
Bot.runCommand("/admin");
