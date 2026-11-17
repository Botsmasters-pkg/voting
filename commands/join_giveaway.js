/*CMD
  command: join_giveaway
  help: Join a contest as a participant and post participant card to channel
  need_reply: false
CMD*/

var gid = options && options.giveaway_id ? options.giveaway_id : (params || "").trim();

if (!gid) {
  Bot.sendMessage("⚠️ Contest ID nahi mili.");
  return;
}

var all_giveaways = Bot.getProperty("all_giveaways", {});
var giveaway = all_giveaways[gid];

if (!giveaway) {
  Bot.sendMessage("❌ Ye Contest exist nahi karta ya delete ho chuka hai.");
  return;
}

if (giveaway.status !== "active") {
  Bot.sendMessage("🛑 Ye Contest abhi band (ended) ho chuka hai.");
  return;
}

var uid = user.telegramid;
giveaway.participants = giveaway.participants || [];
giveaway.vote_counts = giveaway.vote_counts || {};

var already_joined = false;
for (var i = 0; i < giveaway.participants.length; i++) {
  if (giveaway.participants[i].id == uid) {
    already_joined = true;
    break;
  }
}

if (already_joined) {
  var reply_text = 
    "⚠️ <b>Aap pehle hi is Contest me participate kar chuke hain!</b>\n\n" +
    "🏆 <b>Contest:</b> " + giveaway.title + "\n" +
    "🗳 <b>Current Votes:</b> " + (giveaway.vote_counts[uid] || 0) + "\n\n" +
    "Apne friends aur groups me channel post share karke votes badhayein!";
  
  Bot.sendInlineKeyboard([
    [{ text: "📈 My Stats", callback_data: "my_stats", style: "primary" }],
    [{ text: "🔙 Main Menu", callback_data: "/start", style: "primary" }]
  ], reply_text, { parse_mode: "HTML" });
  return;
}

var participant = {
  id: uid,
  name: (user.first_name || "User") + (user.last_name ? (" " + user.last_name) : ""),
  username: user.username || null,
  joined_at: new Date().toISOString()
};

giveaway.participants.push(participant);
giveaway.vote_counts[uid] = 0;
giveaway.voted_users[uid] = [];

all_giveaways[gid] = giveaway;
Bot.setProperty("all_giveaways", all_giveaways, "json");

var joined_cnt = User.getProperty("giveaways_joined", 0);
User.setProperty("giveaways_joined", joined_cnt + 1, "integer");

var uname = user.username ? ("@" + user.username) : "None";
var card_text = 
  "🎯 <b>NEW PARTICIPANT JOINED!</b>\n\n" +
  "👤 <b>Name:</b> " + participant.name + "\n" +
  "🆔 <b>User ID:</b> <code>" + uid + "</code>\n" +
  "📝 <b>Username:</b> " + uname + "\n" +
  "🏆 <b>Contest:</b> " + giveaway.title + "\n\n" +
  "<i>Neeche diye gaye button par click karke inhein vote karein!</i> 👇";

var vote_button = [
  [
    { text: "🗳 Vote - 0", callback_data: "vote " + gid + " " + uid, style: "success" }
  ]
];

Api.sendMessage({
  chat_id: giveaway.channel,
  text: card_text,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: vote_button }
});

var confirm_text = 
  "🎉 <b>Badhai ho! Aap successfully Contest me enter ho gaye hain!</b>\n\n" +
  "🏆 <b>Contest:</b> " + giveaway.title + "\n" +
  "📢 <b>Channel:</b> <code>" + giveaway.channel + "</code>\n\n" +
  "Aapka participant card channel me post ho gaya hai. Ab aap apne friends ko channel se vote karne ke liye bol sakte hain!";

Bot.sendInlineKeyboard([
  [{ text: "📈 My Stats", callback_data: "my_stats", style: "primary" }],
  [{ text: "🔙 Main Menu", callback_data: "/start", style: "primary" }]
], confirm_text, { parse_mode: "HTML" });
