// Simple in-process queue for dev. Exposes `enqueue` which schedules processing via worker.
const worker = require('../workers/prWorker');

const pending = [];

function enqueue(job) {
  // keep a small backlog
  pending.push(job);
  // process asynchronously
  setImmediate(() => {
    const next = pending.shift();
    if (next) {
      worker.process(next).catch((err) => {
        // log and continue
        // eslint-disable-next-line no-console
        console.error('PR worker error', err);
      });
    }
  });
}

module.exports = {
  enqueue,
};
