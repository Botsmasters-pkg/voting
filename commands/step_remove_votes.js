/*CMD
  command: step_remove_votes
  help: Process removing/cutting votes from participant
  need_reply: true
CMD*/

var gid = User.getProperty("active_manage_gid");
if (!gid) {
  Bot.runCommand("my_giveaways");
  return;
}

if (!message) {
  Bot.sendMessage("⚠️ Kripya valid input bhejein (Example: <code>123456789 5</code>).", { parse_mode: "HTML" });
  Bot.runCommand("step_remove_votes");
  return;
}

if (message === "/start" || message.toLowerCase() === "cancel") {
  Bot.runCommand("manage_giveaway " + gid);
  return;
}

function getPropJson(name, default_val) {
  var val = Bot.getProperty(name);
  if (!val) return default_val;
  if (typeof val === "object") return val;
  if (typeof val === "string") {
    try { return JSON.parse(val) || default_val; } catch (e) { return default_val; }
  }
  return default_val;
}

var parts = message.trim().split(" ");
if (parts.length < 2) {
  Bot.sendMessage("⚠️ Format galat hai! User ID aur votes space dekar bhejein.\n<i>Example:</i> <code>1234567890 5</code>", { parse_mode: "HTML" });
  Bot.runCommand("step_remove_votes");
  return;
}

var target_uid = parts[0].trim();
var amount = parseInt(parts[1].trim(), 10);

if (isNaN(amount) || amount <= 0) {
  Bot.sendMessage("⚠️ Votes ki sankhya ek positive number honi chahiye.");
  Bot.runCommand("step_remove_votes");
  return;
}

var all_giveaways = getPropJson("all_giveaways", {});
var giveaway = all_giveaways[gid];

if (!giveaway) {
  Bot.sendMessage("❌ Contest data nahi mila.");
  Bot.runCommand("my_giveaways");
  return;
}

giveaway.vote_counts = giveaway.vote_counts || {};
var current = giveaway.vote_counts[target_uid] || 0;
var new_count = Math.max(0, current - amount);
var actual_removed = current - new_count;
giveaway.vote_counts[target_uid] = new_count;

var total_votes_all = Bot.getProperty("total_votes_count", 0);
Bot.setProperty("total_votes_count", Math.max(0, total_votes_all - actual_removed), "integer");

all_giveaways[gid] = giveaway;
Bot.setProperty("all_giveaways", all_giveaways, "json");

Bot.sendMessage("✅ <b>Votes Removed Successfully!</b>\n\n👤 <b>Participant ID:</b> <code>" + target_uid + "</code>\n➖ <b>Removed:</b> <code>-" + actual_removed + " Votes</code>\n🗳 <b>New Total:</b> <code>" + new_count + " Votes</code>", { parse_mode: "HTML" });

Bot.runCommand("manage_giveaway " + gid);
