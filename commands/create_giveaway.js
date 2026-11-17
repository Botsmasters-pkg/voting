/*CMD
  command: create_giveaway
  help: Start giveaway/contest creation wizard
  need_reply: false
CMD*/

var text = 
  "🎯 <b>Create New Contest / Giveaway</b>\n\n" +
  "<b>Step 1:</b> Apne Telegram Channel ka username ya ID bhejo jisme contest karwana hai.\n\n" +
  "<i>Example:</i> <code>@MyContestChannel</code> ya <code>-1001234567890</code>\n\n" +
  "⚠️ <b>Dhyan dein:</b> Bot ko us channel me pehle <b>Admin</b> banana zaroori hai!";

var buttons = [
  [{ title: "🔙 Cancel", text: "🔙 Cancel", command: "/start", callback_data: "/start", style: "primary" }]
];

Bot.sendInlineKeyboard(buttons, text, { parse_mode: "HTML" });
Bot.runCommand("step_giveaway_channel");
