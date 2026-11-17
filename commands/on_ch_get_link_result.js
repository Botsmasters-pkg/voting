/*CMD
  command: on_ch_get_link_result
  help: Callback when channel invite link is successfully created
  need_reply: false
CMD*/

var link = options && options.result ? options.result.invite_link : null;
var active_channel = User.getProperty("active_channel");

if (!link) {
  Bot.sendMessage("⚠️ Link generate nahi ho paya.");
  return;
}

var text = 
  "🔗 <b>CHANNEL INVITE LINK GENERATED!</b> 🔗\n\n" +
  "📢 <b>Channel:</b> <code>" + active_channel + "</code>\n\n" +
  "👉 <b>Invite Link:</b>\n" +
  "<code>" + link + "</code>\n\n" +
  "<i>Aap is link ko copy karke kahin bhi share kar sakte hain!</i>";

var buttons = [
  [
    { title: "🔗 Open Link", text: "🔗 Open Link", url: link, style: "success" }
  ],
  [
    { title: "🔙 Channel Tools", text: "🔙 Channel Tools", command: "ch_panel", callback_data: "ch_panel", style: "primary" }
  ]
];

Bot.sendInlineKeyboard(buttons, text, { parse_mode: "HTML" });
