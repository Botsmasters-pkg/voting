/*CMD
  command: channel_tools
  help: Display list of all connected channels for admin with auto-sync from contests
  need_reply: false
CMD*/

var OWNER_ID = 8710308658;
if (user.telegramid != OWNER_ID) {
  Bot.sendMessage("🚫 <b>Access Denied:</b> Channel Control sirf Admin ke liye available hai.", { parse_mode: "HTML" });
  return;
}

var channels = Bot.getProperty("connected_channels", {});
var all_giveaways = Bot.getProperty("all_giveaways", {});
var needs_save = false;

// Auto-sync any channels from created contests
for (var gid in all_giveaways) {
  var g = all_giveaways[gid];
  if (g && g.channel) {
    var ch_raw = String(g.channel);
    if (!channels[ch_raw]) {
      var auto_obj = {
        id: ch_raw,
        title: g.channel,
        username: ch_raw.startsWith("@") ? ch_raw.replace("@", "") : "",
        type: "channel",
        added_by: g.creator_name || "Contest Creator",
        added_by_id: g.creator_id || OWNER_ID,
        added_at: g.created_at || new Date().toISOString()
      };
      channels[ch_raw] = auto_obj;
      needs_save = true;
    }
  }
}

if (needs_save) {
  Bot.setProperty("connected_channels", channels, "json");
}

// Deduplicate channels so each channel appears only once in the list
var unique_channels = [];
var seen = {};

for (var k in channels) {
  var item = channels[k];
  if (!item) continue;
  var uniq_id = item.id || k;
  var uname_lower = item.username ? item.username.toLowerCase() : "";
  
  if (!seen[uniq_id] && (!uname_lower || !seen[uname_lower])) {
    seen[uniq_id] = true;
    if (uname_lower) seen[uname_lower] = true;
    unique_channels.push(item);
  }
}

var text = 
  "🎛 <b>CHANNEL ADMIN CONTROL SUITE</b> 🎛\n\n" +
  "Yahan se aap bot me connected sabhi channels ko manage kar sakte hain.\n\n";

var buttons = [];

if (unique_channels.length === 0) {
  text += "⚠️ <i>Abhi koi bhi channel connected nahi hai.</i>\n\n" +
          "Bot ko channel me <b>Admin</b> banayein ya contest banate time channel connect karein.";
} else {
  text += "📋 <b>Connected Channels (" + unique_channels.length + "):</b>\n" +
          "<i>Kisi bhi channel par click karein uski Chat ID, Invite Link, Promote/Demote, aur Delete Message access karne ke liye 👇</i>";
  
  for (var i = 0; i < unique_channels.length; i++) {
    var ch = unique_channels[i];
    var label = "📢 " + ch.title + (ch.username ? (" (@" + ch.username + ")") : "");
    buttons.push([
      { text: label, callback_data: "ch_view " + ch.id, style: "primary" }
    ]);
  }
}

buttons.push([
  { text: "➕ Add Channel Manually", callback_data: "ch_select_prompt", style: "success" }
]);

buttons.push([
  { text: "🔙 Back to Admin Panel", callback_data: "/admin", style: "primary" }
]);

var target_chat = (chat && chat.chatid) ? chat.chatid : user.telegramid;

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
