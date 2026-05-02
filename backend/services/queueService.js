// backend/services/queueService.js
// ═══════════════════════════════════════════════════════
// BullMQ Queue Service with Dead Letter Queue (DLQ)
// ═══════════════════════════════════════════════════════
import { Queue, Worker } from 'bullmq';

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const connection = { url: redisUrl };

let isQueueActive = false;

// DLQ tracking (in-memory fallback when Redis unavailable)
const deadLetterStore = [];

let notificationQueue, auditQueue, emailQueue, dlqQueue;

try {
  // Dead Letter Queue — stores permanently failed jobs
  dlqQueue = new Queue('DeadLetterQueue', { connection });

  notificationQueue = new Queue('NotificationQueue', {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: 100,
      removeOnFail: false, // Keep for DLQ inspection
    }
  });

  auditQueue = new Queue('AuditQueue', {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 500 },
      removeOnComplete: 100,
      removeOnFail: false,
    }
  });

  emailQueue = new Queue('EmailQueue', {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 50,
      removeOnFail: false,
    }
  });

  isQueueActive = true;
  console.log('✅ BullMQ Queues initialized (with DLQ support)');
} catch (e) {
  console.warn('⚠️ BullMQ failed to connect, falling back to memory queue');
}

const queueMap = {
  notification: notificationQueue,
  audit: auditQueue,
  email: emailQueue,
};

export const enqueueJob = async (queueName, jobName, data) => {
  const queue = queueMap[queueName];
  if (isQueueActive && queue) {
    try {
      await queue.add(jobName, data);
      return;
    } catch (err) {
      console.error(`BullMQ enqueue failed (${queueName}), falling back to memory`, err.message);
    }
  }
  // Memory fallback — process immediately
  setTimeout(() => processMemoryJob(queueName, jobName, data), 100);
};

const processMemoryJob = async (queueName, jobName, data) => {
  try {
    if (queueName === 'notification') {
      const { processNotificationJob } = await import('./userNotificationService.js');
      await processNotificationJob(data);
    } else if (queueName === 'audit') {
      const { processAuditJob } = await import('../utils/auditLogger.js');
      await processAuditJob(data);
    } else if (queueName === 'email') {
      const { processEmailJob } = await import('./orderEmailService.js');
      await processEmailJob(data);
    }
  } catch (err) {
    console.error(`Memory Job Failed (${queueName}:${jobName})`, err.message);
    // Store in in-memory DLQ
    deadLetterStore.push({
      queue: queueName,
      jobName,
      data,
      error: err.message,
      failedAt: new Date().toISOString(),
    });
  }
};

/**
 * Move permanently failed job to DLQ
 */
const moveToDLQ = async (job, err, queueName) => {
  const dlqEntry = {
    originalQueue: queueName,
    jobName: job.name,
    data: job.data,
    error: err?.message || 'Unknown error',
    failedAt: new Date().toISOString(),
    attemptsMade: job.attemptsMade,
  };

  if (isQueueActive && dlqQueue) {
    try {
      await dlqQueue.add('dead_letter', dlqEntry);
    } catch (e) {
      deadLetterStore.push(dlqEntry);
    }
  } else {
    deadLetterStore.push(dlqEntry);
  }
  console.error(`[DLQ] Job permanently failed: ${queueName}/${job.name}`, err?.message);
};

// Initialize Workers if Redis is active
if (isQueueActive) {
  new Worker('NotificationQueue', async job => {
    const { processNotificationJob } = await import('./userNotificationService.js');
    await processNotificationJob(job.data);
  }, {
    connection,
    concurrency: 5,
  }).on('failed', (job, err) => {
    if (job.attemptsMade >= job.opts.attempts) {
      moveToDLQ(job, err, 'notification');
    }
  });

  new Worker('AuditQueue', async job => {
    const { processAuditJob } = await import('../utils/auditLogger.js');
    await processAuditJob(job.data);
  }, {
    connection,
    concurrency: 3,
  }).on('failed', (job, err) => {
    if (job.attemptsMade >= job.opts.attempts) {
      moveToDLQ(job, err, 'audit');
    }
  });

  new Worker('EmailQueue', async job => {
    const { processEmailJob } = await import('./orderEmailService.js');
    await processEmailJob(job.data);
  }, {
    connection,
    concurrency: 2,
  }).on('failed', (job, err) => {
    if (job.attemptsMade >= job.opts.attempts) {
      moveToDLQ(job, err, 'email');
    }
  });
}

/**
 * Get failed jobs from all queues (for admin endpoint)
 */
export const getFailedJobs = async () => {
  const results = [];

  // 1. Get from BullMQ DLQ
  if (isQueueActive && dlqQueue) {
    try {
      const waiting = await dlqQueue.getWaiting(0, 100);
      const completed = await dlqQueue.getCompleted(0, 100);
      results.push(...waiting.map(j => ({ source: 'dlq', ...j.data })));
      results.push(...completed.map(j => ({ source: 'dlq', ...j.data })));
    } catch (e) { /* ignore */ }
  }

  // 2. Get failed jobs from individual queues
  for (const [name, queue] of Object.entries(queueMap)) {
    if (!queue) continue;
    try {
      const failed = await queue.getFailed(0, 50);
      results.push(...failed.map(j => ({
        source: name,
        jobName: j.name,
        data: j.data,
        error: j.failedReason,
        failedAt: j.finishedOn ? new Date(j.finishedOn).toISOString() : null,
        attemptsMade: j.attemptsMade,
      })));
    } catch (e) { /* ignore */ }
  }

  // 3. Add in-memory DLQ entries
  results.push(...deadLetterStore.map(e => ({ source: 'memory_dlq', ...e })));

  return results.sort((a, b) => (b.failedAt || '').localeCompare(a.failedAt || ''));
};
