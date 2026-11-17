/*CMD
  command: fsub_check_error
  help: Error handler during Telegram getChatMember force sub check
  need_reply: false
CMD*/

var uid = user.telegramid;
var index = parseInt(params || "0", 10);
if (isNaN(index)) index = 0;

function getPropJson(name, default_val) {
  var val = Bot.getProperty(name);
  if (!val) return default_val;
  if (typeof val === "object") return val;
  if (typeof val === "string") {
    try { return JSON.parse(val) || default_val; } catch (e) { return default_val; }
  }
  return default_val;
}

var fsub_channels = getPropJson("fsub_channels", []);
if (index < fsub_channels.length) {
  var ch = fsub_channels[index];
  // If request channel, do not block user if bot cannot fetch pending member state
  if (ch && ch.type === "request") {
    Bot.run({
      command: "fsub_verify",
      run_after: 0.1,
      options: { index: index + 1 }
    });
    return;
  }
}

// Render 3x3 grid with primary JOIN buttons
var rows = [];
var currentRow = [];
for (var i = 0; i < fsub_channels.length; i++) {
  currentRow.push({
    text: "JOIN",
    url: fsub_channels[i].link,
    style: "primary"
  });
  if (currentRow.length === 3) {
    rows.push(currentRow);
    currentRow = [];
  }
}
if (currentRow.length > 0) {
  rows.push(currentRow);
}

rows.push([
  { text: "✅ VERIFY", callback_data: "fsub_verify", style: "success" }
]);

var alert_msg = 
  "⚠️ <b>ACCESS RESTRICTED: CHANNELS JOIN REQUIRED!</b> ⚠️\n\n" +
  "Bot use karne ke liye neeche diye gaye sabhi channels ko join karein aur <b>✅ VERIFY</b> dabayein.\n\n" +
  "✨ <i>Request channels me agar request pending hai to bhi verify ho jayega!</i>";

Api.sendMessage({
  chat_id: uid,
  text: alert_msg,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: rows }
});
