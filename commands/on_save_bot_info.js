/*CMD
  command: on_save_bot_info
  help: Automatically detects and saves bot username from connected token
  need_reply: false
CMD*/

var uname = null;
if (options) {
  if (options.result && options.result.username) {
    uname = options.result.username;
  } else if (options.username) {
    uname = options.username;
  }
}

if (!uname) {
  var bInfo = Bot.getProperty("bot_info");
  if (bInfo) {
    if (bInfo.result && bInfo.result.username) uname = bInfo.result.username;
    else if (bInfo.username) uname = bInfo.username;
  }
}

if (uname) {
  var clean_name = uname.replace("@", "");
  Bot.setProperty("bot_username", clean_name, "string");
  if (options && options.result && options.result.id) {
    Bot.setProperty("bot_id", options.result.id, "integer");
  }
}
