/*CMD
  command: admin_fsub_toggle
  help: Toggle Force Sub on or off
  need_reply: false
CMD*/

var OWNER_ID = 8710308658;
if (user.telegramid != OWNER_ID) return;

if (request && request.callback_query) {
  Api.answerCallbackQuery({
    callback_query_id: request.callback_query.id
  });
}

var current = Bot.getProperty("fsub_enabled");
if (current === null || current === undefined) current = true;

var new_val = !current;
Bot.setProperty("fsub_enabled", new_val, "boolean");

Bot.runCommand("admin_fsub");
