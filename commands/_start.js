/*CMD
  command: /start
  help: Start the bot & show main menu with colored primary and success buttons
  need_reply: false
  aliases: 
CMD*/

// ===== CONFIG =====
var OWNER_ID = 8710308658;

// Dynamic Bot Username Detection from Token
var BOT_USERNAME = Bot.getProperty("bot_username");
if (!BOT_USERNAME) {
  var bInfo = Bot.getProperty("bot_info");
  if (bInfo) {
    if (bInfo.result && bInfo.result.username) {
      BOT_USERNAME = bInfo.result.username.replace("@", "");
      Bot.setProperty("bot_username", BOT_USERNAME, "string");
    } else if (bInfo.username) {
      BOT_USERNAME = bInfo.username.replace("@", "");
      Bot.setProperty("bot_username", BOT_USERNAME, "string");
    }
  }
}

// If username not yet detected from token, query Telegram getMe and re-render
if (!BOT_USERNAME) {
  Api.getMe({
    result_to_bot_property: "bot_info",
    on_result: "on_first_get_me"
  });
  return;
}

// Check Ban Status
var banned_users = Bot.getProperty("banned_users", []);
var uid = user.telegramid;
if (banned_users && (banned_users.indexOf(uid) !== -1 || banned_users.indexOf(Number(uid)) !== -1)) {
  Bot.sendMessage("🚫 <b>Access Denied:</b> Aapko is bot se ban kiya gaya hai.", { parse_mode: "HTML" });
  return;
}

// Register user
var all_users = Bot.getProperty("all_users", []);
if (all_users.indexOf(uid) === -1) {
  all_users.push(uid);
  Bot.setProperty("all_users", all_users, "json");
  
  User.setProperty("votes_given", 0, "integer");
  User.setProperty("votes_received", 0, "integer");
  User.setProperty("giveaways_joined", 0, "integer");
  User.setProperty("giveaways_created", 0, "integer");
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

// Force Sub Gate Check
var fsub_enabled = Bot.getProperty("fsub_enabled");
if (fsub_enabled === null || fsub_enabled === undefined) fsub_enabled = true;
var fsub_channels = getPropJson("fsub_channels", []);

if (fsub_enabled && fsub_channels.length > 0 && uid != OWNER_ID) {
  var current_version = fsub_channels.map(function(c) { return c.chat_id; }).join(",");
  var user_version = User.getProperty("fsub_verified_version");

  if (user_version !== current_version) {
    if (params) {
      User.setProperty("pending_start_params", params.trim(), "string");
    }

    var fsub_rows = [];
    var fsub_curr_row = [];
    for (var fi = 0; fi < fsub_channels.length; fi++) {
      fsub_curr_row.push({
        text: "JOIN",
        url: fsub_channels[fi].link,
        style: "primary"
      });
      if (fsub_curr_row.length === 3) {
        fsub_rows.push(fsub_curr_row);
        fsub_curr_row = [];
      }
    }
    if (fsub_curr_row.length > 0) {
      fsub_rows.push(fsub_curr_row);
    }
    fsub_rows.push([
      { text: "✅ VERIFY", callback_data: "fsub_verify", style: "success" }
    ]);

    var fsub_lock_text = 
      "👋 <b>Welcome to Toxic Vote Giveaway Bot!</b>\n\n" +
      "⚠️ <b>Access Restricted:</b> Bot ko use karne ke liye pehle neeche diye gaye sabhi channels join karein.\n\n" +
      "👇 Sabhi channels join karne ke baad <b>✅ VERIFY</b> button dabayein:\n" +
      "✨ <i>Request channels me agar aapka join request pending hai to bhi verify ho jayega!</i>";

    var target_chat_fsub = (chat && chat.chatid) ? chat.chatid : user.telegramid;
    if (request && request.callback_query && request.callback_query.message) {
      Api.editMessageText({
        chat_id: request.callback_query.message.chat.id,
        message_id: request.callback_query.message.message_id,
        text: fsub_lock_text,
        parse_mode: "HTML",
        reply_markup: { inline_keyboard: fsub_rows }
      });
    } else {
      Api.sendMessage({
        chat_id: target_chat_fsub,
        text: fsub_lock_text,
        parse_mode: "HTML",
        reply_markup: { inline_keyboard: fsub_rows }
      });
    }
    return;
  }
}

// Restore pending params if user just verified
if (!params) {
  var saved_params = User.getProperty("pending_start_params");
  if (saved_params) {
    params = saved_params;
    User.setProperty("pending_start_params", null, "string");
  }
}

if (params) {
  var param_str = params.trim();
  if (param_str.indexOf("vote_") === 0) {
    Bot.run({
      command: "vote_referral",
      options: { raw: param_str }
    });
    return;
  }
  if (param_str.indexOf("join_") === 0) {
    param_str = param_str.replace("join_", "");
  }
  Bot.run({
    command: "join_giveaway",
    options: { giveaway_id: param_str }
  });
  return;
}

var welcome_text = 
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

var target_chat = (chat && chat.chatid) ? chat.chatid : user.telegramid;

if (request && request.callback_query) {
  Api.answerCallbackQuery({
    callback_query_id: request.callback_query.id
  });
}

// Direct Telegram API call to render vibrant success (green) & primary (blue) buttons
if (request && request.callback_query && request.callback_query.message) {
  Api.editMessageText({
    chat_id: request.callback_query.message.chat.id,
    message_id: request.callback_query.message.message_id,
    text: welcome_text,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: buttons }
  });
} else {
  Api.sendMessage({
    chat_id: target_chat,
    text: welcome_text,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: buttons }
  });
}
