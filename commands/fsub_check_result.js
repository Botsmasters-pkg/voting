/*CMD
  command: fsub_check_result
  help: Process Telegram API getChatMember response for Force Sub verification
  need_reply: false
CMD*/

var uid = user.telegramid;
var index = parseInt(params || "0", 10);
if (isNaN(index)) index = 0;

function getPropJson(name, default_val) {
  var val = Bot.getProperty(name);
  if (!val) return default_val;
  if (typeof val === "object") return val;
  if (typeof val === "string") {
    try { return JSON.parse(val) || default_val; } catch (e) { return default_val; }
  }
  return default_val;
}

var fsub_channels = getPropJson("fsub_channels", []);
if (index >= fsub_channels.length) {
  Bot.run({
    command: "fsub_verify",
    run_after: 0.1,
    options: { index: index }
  });
  return;
}

var ch = fsub_channels[index];
var member = (options && options.result) ? options.result : null;
var status = member ? member.status : "";

var is_member = (status === "creator" || status === "administrator" || status === "member" || (status === "restricted" && member.is_member));

// Special logic for Private Request Channel:
// "रिक्वेस्ट चैनल में ये है कि उसका यूजर का रिक्वेस्ट पेंडिंग में रहे तो भी वेरिफाई माना जाए, एडमिन का अप्रूवल का वेट न करे, ओके।"
if (!is_member && ch.type === "request") {
  is_member = true;
}

if (is_member) {
  Bot.run({
    command: "fsub_verify",
    run_after: 0.1,
    options: { index: index + 1 }
  });
} else {
  // Not joined: Render 3x3 grid with primary JOIN buttons
  var rows = [];
  var currentRow = [];
  for (var i = 0; i < fsub_channels.length; i++) {
    currentRow.push({
      text: "JOIN",
      url: fsub_channels[i].link,
      style: "primary"
    });
    if (currentRow.length === 3) {
      rows.push(currentRow);
      currentRow = [];
    }
  }
  if (currentRow.length > 0) {
    rows.push(currentRow);
  }

  rows.push([
    { text: "✅ VERIFY", callback_data: "fsub_verify", style: "success" }
  ]);

  var alert_msg = 
    "⚠️ <b>ACCESS RESTRICTED: CHANNELS JOIN REQUIRED!</b> ⚠️\n\n" +
    "Aapne abhi tak sabhi required channels ko join nahi kiya hai.\n" +
    "Kripya neeche diye gaye sabhi <b>JOIN</b> buttons par click karke channel join karein aur phir <b>✅ VERIFY</b> par click karein!\n\n" +
    "✨ <i>Request channels me agar aapka join request pending hai to bhi verify ho jayega!</i>";

  Api.sendMessage({
    chat_id: uid,
    text: alert_msg,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: rows }
  });
}
