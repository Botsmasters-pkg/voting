/*CMD
  command: fsub_verify
  help: Verify force sub channels for user with instant approval for join request channels
  need_reply: false
CMD*/

var OWNER_ID = 8710308658;
var uid = user.telegramid;

if (request && request.callback_query) {
  Api.answerCallbackQuery({
    callback_query_id: request.callback_query.id,
    text: "🔍 Checking channel membership..."
  });
}

// Admin is automatically verified
if (uid == OWNER_ID) {
  Bot.runCommand("/start");
  return;
}

function getPropJson(name, default_val) {
  var val = Bot.getProperty(name);
  if (!val) return default_val;
  if (typeof val === "object") return val;
  if (typeof val === "string") {
    try { return JSON.parse(val) || default_val; } catch (e) { return default_val; }
  }
  return default_val;
}

var fsub_enabled = Bot.getProperty("fsub_enabled");
if (fsub_enabled === false) {
  Bot.runCommand("/start");
  return;
}

var fsub_channels = getPropJson("fsub_channels", []);
if (fsub_channels.length === 0) {
  Bot.runCommand("/start");
  return;
}

// Start checking from index 0
Bot.run({
  command: "fsub_verify_step",
  options: { index: 0 }
});
