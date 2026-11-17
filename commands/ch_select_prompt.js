/*CMD
  command: ch_select_prompt
  help: Ask user for channel username or ID
  need_reply: false
CMD*/

var text = 
  "📢 <b>Channel Setup</b>\n\n" +
  "Apne Telegram Channel ka username ya ID bhejo:\n\n" +
  "<i>Example:</i> <code>@MyChannel</code> ya <code>-1001234567890</code>\n\n" +
  "⚠️ <b>Note:</b> Bot ko channel me pehle <b>Admin</b> banana zaroori hai (with Add Admin, Delete Messages & Invite Links permissions).";

var buttons = [
  [{ title: "🔙 Cancel", text: "🔙 Cancel", command: "channel_tools", callback_data: "channel_tools" }]
];

Bot.sendInlineKeyboard(buttons, text, { parse_mode: "HTML" });
Bot.runCommand("step_ch_select");
