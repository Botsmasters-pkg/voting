/*CMD
  command: on_channel_post_error
  help: Callback when contest announcement post fails
  need_reply: false
CMD*/

var err = options && options.error ? options.error : "Unknown error";
Bot.sendMessage("⚠️ <b>Warning:</b> Bot channel me message post nahi kar paya.\n\n<i>Check karein ki bot channel me added hai aur Post Messages ki permission hai.</i>\n\nDetail: " + JSON.stringify(err), { parse_mode: "HTML" });\n