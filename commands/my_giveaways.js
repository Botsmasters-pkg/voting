/*CMD
  command: my_giveaways
  help: List user created contests with clickable buttons to manage each contest
  need_reply: false
CMD*/

var OWNER_ID = 8710308658;

function getPropJson(name, default_val) {
  var val = Bot.getProperty(name);
  if (!val) return default_val;
  if (typeof val === "object") return val;
  if (typeof val === "string") {
    try { return JSON.parse(val) || default_val; } catch (e) { return default_val; }
  }
  return default_val;
}

var all_giveaways = getPropJson("all_giveaways", {});
var my_list = User.getProperty("my_giveaway_ids", []);
var uid = user.telegramid;
var target_chat = (chat && chat.chatid) ? chat.chatid : user.telegramid;

// Gather contest list: Admin sees all, normal user sees their own
var contest_keys = [];

if (uid == OWNER_ID) {
  for (var k in all_giveaways) {
    contest_keys.push(k);
  }
} else {
  if (Array.isArray(my_list)) {
    for (var i = 0; i < my_list.length; i++) {
      if (all_giveaways[my_list[i]]) {
        contest_keys.push(my_list[i]);
      }
    }
  }
}

if (contest_keys.length === 0) {
  var empty_text = 
    "📊 <b>MANAGE CONTESTS</b> 📊\n\n" +
    "Aapne abhi tak koi bhi Contest create nahi kiya hai.\n\n" +
    "Naya contest shuru karne ke liye neeche <b>➕ Create Contest</b> dabayein!";
  
  var empty_buttons = [
    [{ text: "➕ Create Contest", callback_data: "create_giveaway", style: "success" }],
    [{ text: "🔙 Main Menu", callback_data: "/start", style: "primary" }]
  ];
  
  if (request && request.callback_query && request.callback_query.message) {
    Api.editMessageText({
      chat_id: request.callback_query.message.chat.id,
      message_id: request.callback_query.message.message_id,
      text: empty_text,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: empty_buttons }
    });
  } else {
    Api.sendMessage({
      chat_id: target_chat,
      text: empty_text,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: empty_buttons }
    });
  }
  return;
}

var text = 
  "📊 <b>MANAGE YOUR CONTESTS</b> 📊\n\n" +
  "Total Contests: <code>" + contest_keys.length + "</code>\n\n" +
  "<i>Kisi bhi contest par click karein use manage karne, votes add/cut karne, leaderboard dekhne, ya end karne ke liye 👇</i>";

var buttons = [];

for (var j = 0; j < contest_keys.length; j++) {
  var gid = contest_keys[j];
  var g = all_giveaways[gid];
  if (g) {
    var status_badge = (g.status === "ended") ? "🔴 " : "🟢 ";
    var ch_name = g.channel || "Channel";
    var g_title = g.title || "Contest";
    var btn_label = status_badge + ch_name + " • " + (g_title.length > 20 ? (g_title.substring(0, 18) + "..") : g_title);
    buttons.push([
      { text: btn_label, callback_data: "manage_giveaway " + gid, style: "primary" }
    ]);
  }
}

buttons.push([
  { text: "➕ Create New", callback_data: "create_giveaway", style: "success" },
  { text: "🔙 Main Menu", callback_data: "/start", style: "primary" }
]);

if (request && request.callback_query && request.callback_query.message) {
  Api.editMessageText({
    chat_id: request.callback_query.message.chat.id,
    message_id: request.callback_query.message.message_id,
    text: text,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: buttons }
  });
} else {
  Api.sendMessage({
    chat_id: target_chat,
    text: text,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: buttons }
  });
}
