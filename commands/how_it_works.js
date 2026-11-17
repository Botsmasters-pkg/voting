/*CMD
  command: how_it_works
  help: Explains bot usage guide
  need_reply: false
CMD*/

var text = 
  "ℹ️ <b>HOW TOXIC VOTING BOT WORKS:</b>\n\n" +
  "<b>1️⃣ Step 1: Bot ko Channel me Admin banayein</b>\n" +
  "• Bot ko apne Telegram Channel me add karein aur <i>Post Messages</i> & <i>Edit Messages</i> ki permission dein.\n\n" +
  "<b>2️⃣ Step 2: Contest Create karein</b>\n" +
  "• Bot me <b>➕ Create Contest</b> button dabayein.\n" +
  "• Channel username aur Contest ka Title/Prize enter karein.\n\n" +
  "<b>3️⃣ Step 3: Participants Join karenge</b>\n" +
  "• Channel me Contest announcement post ho jayegi.\n" +
  "• Users <b>🎯 Join Contest</b> par click karke participate karenge.\n\n" +
  "<b>4️⃣ Step 4: Voting Shuru!</b>\n" +
  "• Har participant ka voting card automatically channel me post ho jata hai.\n" +
  "• Voters <b>🗳 Vote</b> button daba kar vote karenge.\n" +
  "• Bot ensure karta hai ki ek user ek hi vote de sake!";

var buttons = [
  [{ text: "➕ Start Now", callback_data: "create_giveaway", style: "success" }],
  [{ text: "🔙 Main Menu", callback_data: "/start", style: "primary" }]
];

Bot.sendInlineKeyboard(buttons, text, { parse_mode: "HTML" });
