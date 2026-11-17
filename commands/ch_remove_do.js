/*CMD
  command: ch_remove_do
  help: Remove channel from connected list
  need_reply: false
CMD*/

var target_chid = (params || "").trim();
var channels = Bot.getProperty("connected_channels", {});

if (channels[target_chid]) {
  delete channels[target_chid];
  Bot.setProperty("connected_channels", channels, "json");
}

Bot.sendMessage("✅ Channel <code>" + target_chid + "</code> list se hata diya gaya hai.", { parse_mode: "HTML" });
Bot.runCommand("channel_tools");
