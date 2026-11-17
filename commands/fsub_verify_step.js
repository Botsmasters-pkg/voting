/*CMD
  command: fsub_verify_step
  help: Step-by-step verification of force sub channels with instant feature display
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

  // Check if user came via a referral link (vote or join)
  var saved_params = User.getProperty("pending_start_params");
  if (saved_params) {
    User.setProperty("pending_start_params", null, "string");
    Api.sendMessage({
      chat_id: uid,
      text: "✅ <b>Verification Successful!</b>\n\nAb aapka request process kiya ja raha hai... 🚀",
      parse_mode: "HTML"
    });
    Bot.run({ command: "/start", params: saved_params });
    return;
  }

  // Directly display the full /start Welcome Menu & features automatically!
  var BOT_USERNAME = Bot.getProperty("bot_username");
  if (!BOT_USERNAME) {
    var bInfo = getPropJson("bot_info", null);
    if (bInfo) {
      if (bInfo.result && bInfo.result.username) BOT_USERNAME = bInfo.result.username.replace("@", "");
      else if (bInfo.username) BOT_USERNAME = bInfo.username.replace("@", "");
    }
  }
  if (!BOT_USERNAME) BOT_USERNAME = "bot";

  var welcome_text = 
    "✅ <b>Verification Successful!</b>\n\n" +
    "✨ <b>WELCOME TO TOXIC VOTE GIVEAWAY BOT</b> ✨\n\n" +
    "<i>☄️ Create Powerful Vote Giveaways</i>\n" +
    "<i>🔜 Real Time Vote System</i>\n" +
    "<i>📈 Advanced Management Tools</i>\n" +
    "<i>❤️‍🔥 Leaderboard & Analytics</i>\n\n" +
    "<b>🚀 START CREATING NOW!</b>";

  var connect_url = "https://t.me/" + BOT_USERNAME + "?startchannel=true&admin=post_messages";

  var buttons = [
    [
      { text: "CONNECT", url: connect_url, style: "success" }
    ],
    [
      { text: "CREATE", callback_data: "create_giveaway", style: "primary" },
      { text: "MANAGE", callback_data: "my_giveaways", style: "primary" }
    ],
    [
      { text: "MY STATS", callback_data: "my_stats", style: "primary" },
      { text: "HOW IT WORKS", callback_data: "how_it_works", style: "primary" }
    ],
    [
      { text: "👨‍💻 Developer", url: "https://t.me/codevexa", style: "success" }
    ]
  ];

  if (uid == OWNER_ID) {
    buttons.push([
      { text: "⚙️ ADMIN PANEL", callback_data: "/admin", style: "primary" }
    ]);
  }

  Api.sendMessage({
    chat_id: uid,
    text: welcome_text,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: buttons }
  });
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
