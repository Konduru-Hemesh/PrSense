const path = require('path');

let queueClient = null;

try {
  const IORedis = require('ioredis');
  const { Queue, Worker, QueueScheduler } = require('bullmq');

  const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
  const connection = new IORedis(redisUrl);
  const queueName = 'pr-jobs';

  const queue = new Queue(queueName, { connection });
  // ensures stalled jobs are retried
  new QueueScheduler(queueName, { connection });

  // Worker runs the existing prWorker.process implementation
  const prWorker = require(path.join(__dirname, '..', 'workers', 'prWorker'));
  const worker = new Worker(
    queueName,
    async (job) => {
      await prWorker.process(job.data);
    },
    { connection, concurrency: Number(process.env.PR_WORKER_CONCURRENCY || 2) }
  );

  worker.on('failed', (job, err) => {
    // eslint-disable-next-line no-console
    console.error('PR job failed', job.id, err.message || err);
  });

  queueClient = {
    enqueue: async (data) => {
      await queue.add('pr', data, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: 100,
        removeOnFail: 100,
      });
    },
  };
} catch (err) {
  // Fall back silently to the in-process queue when BullMQ is unavailable.
  // The app keeps working in dev without Redis.
  // eslint-disable-next-line global-require
  queueClient = require('./queue');
}

module.exports = queueClient;
