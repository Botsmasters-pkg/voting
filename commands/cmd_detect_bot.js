/*CMD
  command: cmd_detect_bot
  help: Trigger getMe to refresh bot username from token
  need_reply: false
CMD*/

Api.getMe({
  result_to_bot_property: "bot_info",
  on_result: "on_admin_detect_bot"
});
Bot.sendMessage("🔄 Telegram API se Bot Token ka username detect ho raha hai...");
