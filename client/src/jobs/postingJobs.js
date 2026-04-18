import { postContent } from "../integrations/social/connectors";
import { QUEUE_STATUS } from "../queues/postQueue";
import { cronMatchesNow } from "../scheduler/cronRunner";

function countPostedToday(queue, now = new Date()) {
  const dayKey = now.toISOString().slice(0, 10);
  return queue.filter((item) => item.postedAt?.slice(0, 10) === dayKey).length;
}

function minutesSinceLastPost(queue, now = new Date()) {
  const latest = queue
    .filter((item) => item.postedAt)
    .map((item) => new Date(item.postedAt).getTime())
    .sort((a, b) => b - a)[0];

  if (!latest) {
    return Infinity;
  }

  return Math.floor((now.getTime() - latest) / 60000);
}

export async function runScheduledPostingJob(state, options = {}) {
  const now = options.now || new Date();
  const scheduler = state.postingScheduler;
  const queue = state.postQueue || [];
  const logs = [];

  if (!scheduler?.enabled) {
    return { state, logs: [{ level: "info", message: "Scheduler disabled. No posts processed." }] };
  }

  if (scheduler.mode === "scheduled" && !cronMatchesNow(scheduler.cronExpression, now)) {
    return { state: { ...state, postingScheduler: { ...scheduler, lastTickAt: now.toISOString() } }, logs: [{ level: "info", message: "Cron did not match this tick." }] };
  }

  if (countPostedToday(queue, now) >= Number(scheduler.maxPostsPerDay || 0)) {
    return { state, logs: [{ level: "warn", message: "Daily post limit reached. Queue paused for safety." }] };
  }

  if (minutesSinceLastPost(queue, now) < Number(scheduler.minMinutesBetweenPosts || 0)) {
    return { state, logs: [{ level: "warn", message: "Rate limit spacing active. Waiting before next post." }] };
  }

  const dueItem = queue.find((item) => {
    const isDue = new Date(item.scheduledAt).getTime() <= now.getTime();
    const approvalOk = !scheduler.manualApprovalRequired || item.approvalStatus === "approved";
    return item.status === QUEUE_STATUS.scheduled && isDue && approvalOk;
  });

  if (!dueItem) {
    return { state: { ...state, postingScheduler: { ...scheduler, lastTickAt: now.toISOString() } }, logs: [{ level: "info", message: "No approved due posts found." }] };
  }

  try {
    const result = await postContent(dueItem.platform, dueItem, state.socialConnectorConfig);
    const nextQueue = queue.map((item) =>
      item.id === dueItem.id
        ? {
            ...item,
            status: QUEUE_STATUS.posted,
            attempts: item.attempts + 1,
            postedAt: now.toISOString(),
            lastError: "",
            externalPostId: result.externalId,
            mockMode: result.mode === "mock"
          }
        : item
    );

    logs.push({
      level: "success",
      message: `${result.mode === "mock" ? "Mock posted" : "Posted"} ${dueItem.id} to ${dueItem.platform}.`,
      result
    });

    return {
      state: {
        ...state,
        postQueue: nextQueue,
        postingScheduler: { ...scheduler, lastTickAt: now.toISOString() }
      },
      logs
    };
  } catch (error) {
    const nextQueue = queue.map((item) =>
      item.id === dueItem.id
        ? {
            ...item,
            status: item.attempts + 1 >= item.maxAttempts ? QUEUE_STATUS.failed : QUEUE_STATUS.scheduled,
            attempts: item.attempts + 1,
            lastError: String(error?.message || error)
          }
        : item
    );

    return {
      state: {
        ...state,
        postQueue: nextQueue,
        postingScheduler: { ...scheduler, lastTickAt: now.toISOString() }
      },
      logs: [{ level: "error", message: String(error?.message || error) }]
    };
  }
}
