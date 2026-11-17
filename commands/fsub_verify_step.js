/*CMD
  command: fsub_verify_step
  help: Step-by-step verification proxy to prevent call stack accumulation
  need_reply: false
CMD*/

var idx = (options && options.index !== undefined) ? parseInt(options.index, 10) : parseInt(params || "0", 10);
if (isNaN(idx)) idx = 0;

Bot.run({
  command: "fsub_verify",
  run_after: 0.1,
  options: { index: idx }
});
