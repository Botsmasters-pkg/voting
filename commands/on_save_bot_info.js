/*CMD
  command: on_save_bot_info
  help: Automatically detects and saves bot username from connected token
  need_reply: false
CMD*/

if (options && options.result && options.result.username) {
  var detected_uname = options.result.username.replace("@", "");
  Bot.setProperty("bot_username", detected_uname, "string");
  Bot.setProperty("bot_id", options.result.id, "integer");
}
