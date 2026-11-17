/*CMD
  command: fsub_verify_step
  help: Step-by-step verification of force sub channels
  need_reply: false
CMD*/

var OWNER_ID = 8710308658;
var uid = user.telegramid;

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
var index = (options && options.index !== undefined) ? parseInt(options.index, 10) : parseInt(params || "0", 10);

// If all channels verified
if (index >= fsub_channels.length) {
  var current_version = fsub_channels.map(function(c) { return c.chat_id; }).join(",");
  User.setProperty("fsub_verified_version", current_version, "string");
  User.setProperty("fsub_verified", true, "boolean");

  Api.sendMessage({
    chat_id: uid,
    text: "🎉 <b>VERIFICATION SUCCESSFUL!</b> 🎉\n\nAapne sabhi required channels join kar liye hain. Bot successfully unlock ho gaya hai! 🚀",
    parse_mode: "HTML"
  });

  Bot.runCommand("/start");
  return;
}

var ch = fsub_channels[index];

// Special rule for Request Channel: If join request is already logged, accept immediately!
if (ch.type === "request") {
  var req_key = "fsub_requested_" + ch.chat_id + "_" + uid;
  if (Bot.getProperty(req_key)) {
    Bot.run({
      command: "fsub_verify_step",
      options: { index: index + 1 }
    });
    return;
  }
}

// Check membership via Telegram getChatMember
Api.getChatMember({
  chat_id: ch.chat_id,
  user_id: uid,
  on_result: "fsub_check_result " + index,
  on_error: "fsub_check_error " + index
});
