/*CMD
  command: my_giveaways
  help: List user created contests
  need_reply: false
CMD*/

var my_list = User.getProperty("my_giveaway_ids", []);
var all_giveaways = Bot.getProperty("all_giveaways", {});

if (!my_list || my_list.length === 0) {
  var empty_text = 
    "📊 <b>My Contests</b>\n\n" +
    "Aapne abhi tak koi bhi Contest create nahi kiya hai.\n\n" +
    "Naya contest shuru karne ke liye neeche button dabayein!";
  
  Bot.sendInlineKeyboard([
    [{ title: "➕ Create Contest", text: "➕ Create Contest", command: "create_giveaway", callback_data: "create_giveaway" }],
    [{ title: "🔙 Main Menu", text: "🔙 Main Menu", command: "/start", callback_data: "/start" }]
  ], empty_text, { parse_mode: "HTML" });
  return;
}

var text = "📊 <b>Your Created Contests:</b>\n\n";

for (var i = 0; i < my_list.length; i++) {
  var gid = my_list[i];
  var g = all_giveaways[gid];
  if (g) {
    var p_count = g.participants ? g.participants.length : 0;
    var total_v = 0;
    if (g.vote_counts) {
      for (var k in g.vote_counts) {
        total_v += g.vote_counts[k];
      }
    }
    text += "🔹 <b>" + g.title + "</b>\n" +
            "   • ID: <code>" + gid + "</code>\n" +
            "   • Status: <b>" + (g.status || "active").toUpperCase() + "</b>\n" +
            "   • Channel: <code>" + g.channel + "</code>\n" +
            "   • Participants: <b>" + p_count + "</b>\n" +
            "   • Total Votes: <b>" + total_v + "</b>\n\n";
  }
}

var buttons = [
  [{ title: "➕ Create Another", text: "➕ Create Another", command: "create_giveaway", callback_data: "create_giveaway" }],
  [{ title: "🔙 Main Menu", text: "🔙 Main Menu", command: "/start", callback_data: "/start" }]
];

Bot.sendInlineKeyboard(buttons, text, { parse_mode: "HTML" });
