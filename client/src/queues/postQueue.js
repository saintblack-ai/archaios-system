import { SUPPORTED_PLATFORMS } from "../integrations/social/connectors";

export const QUEUE_STATUS = {
  pending: "pending",
  scheduled: "scheduled",
  posted: "posted",
  failed: "failed",
  skipped: "skipped"
};

function normalizePlatform(platform) {
  if (platform === "Twitter") {
    return "X";
  }

  return SUPPORTED_PLATFORMS.includes(platform) ? platform : "X";
}

export function createPostQueueFromContent(contentLibrary, options = {}) {
  const startAt = options.startAt ? new Date(options.startAt) : new Date();
  const maxItems = options.maxItems || 30;
  const posts = (contentLibrary.socialPosts || []).slice(0, maxItems);

  return posts.map((post, index) => {
    const scheduledAt = new Date(startAt);
    scheduledAt.setHours(9 + (index % 8), index % 2 === 0 ? 0 : 30, 0, 0);
    scheduledAt.setDate(startAt.getDate() + Math.floor(index / 3));

    return {
      id: `queue-${post.id}`,
      sourceContentId: post.id,
      bookId: post.bookId,
      platform: normalizePlatform(post.platform),
      copy: post.copy,
      cta: post.cta,
      status: QUEUE_STATUS.pending,
      approvalStatus: "needs-approval",
      scheduledAt: scheduledAt.toISOString(),
      attempts: 0,
      maxAttempts: 3,
      lastError: "",
      createdAt: new Date().toISOString(),
      postedAt: null
    };
  });
}

export function schedulePendingPosts(queue, scheduleAt) {
  return queue.map((item, index) => {
    if (item.status !== QUEUE_STATUS.pending) {
      return item;
    }

    const scheduledAt = new Date(scheduleAt || item.scheduledAt || Date.now());
    scheduledAt.setMinutes(scheduledAt.getMinutes() + index * 20);

    return {
      ...item,
      status: QUEUE_STATUS.scheduled,
      scheduledAt: scheduledAt.toISOString()
    };
  });
}

export function approveQueueItem(queue, itemId) {
  return queue.map((item) => (item.id === itemId ? { ...item, approvalStatus: "approved" } : item));
}

export function retryFailedPosts(queue) {
  return queue.map((item) =>
    item.status === QUEUE_STATUS.failed && item.attempts < item.maxAttempts
      ? { ...item, status: QUEUE_STATUS.scheduled, lastError: "" }
      : item
  );
}

export function getQueueSummary(queue = []) {
  return {
    pending: queue.filter((item) => item.status === QUEUE_STATUS.pending).length,
    scheduled: queue.filter((item) => item.status === QUEUE_STATUS.scheduled).length,
    posted: queue.filter((item) => item.status === QUEUE_STATUS.posted).length,
    failed: queue.filter((item) => item.status === QUEUE_STATUS.failed).length,
    needsApproval: queue.filter((item) => item.approvalStatus !== "approved").length
  };
}
