export function parseCronExpression(expression) {
  const parts = String(expression || "").trim().split(/\s+/);
  if (parts.length !== 5) {
    return { valid: false, reason: "Use five-field cron format: minute hour day month weekday." };
  }

  const [minute, hour, day, month, weekday] = parts;
  return { valid: true, minute, hour, day, month, weekday, expression };
}

function fieldMatches(field, value) {
  if (field === "*") {
    return true;
  }

  if (field.includes("/")) {
    const [base, step] = field.split("/");
    const stepValue = Number(step);
    if (!stepValue) {
      return false;
    }
    return (base === "*" || Number(base) <= value) && value % stepValue === 0;
  }

  if (field.includes(",")) {
    return field.split(",").map(Number).includes(value);
  }

  return Number(field) === value;
}

export function cronMatchesNow(expression, date = new Date()) {
  const parsed = parseCronExpression(expression);
  if (!parsed.valid) {
    return false;
  }

  return (
    fieldMatches(parsed.minute, date.getMinutes()) &&
    fieldMatches(parsed.hour, date.getHours()) &&
    fieldMatches(parsed.day, date.getDate()) &&
    fieldMatches(parsed.month, date.getMonth() + 1) &&
    fieldMatches(parsed.weekday, date.getDay())
  );
}

export function createDefaultScheduler() {
  return {
    enabled: false,
    mode: "manual",
    cronExpression: "0 9 * * *",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "local",
    lastTickAt: null,
    nextTickHint: "Daily at 9:00 local time",
    maxPostsPerDay: 3,
    minMinutesBetweenPosts: 120,
    manualApprovalRequired: true,
    autoPostEnabled: false
  };
}

export function updateSchedulerMode(settings, mode) {
  const safeMode = ["manual", "scheduled", "auto-post"].includes(mode) ? mode : "manual";

  return {
    ...settings,
    mode: safeMode,
    enabled: safeMode !== "manual",
    autoPostEnabled: safeMode === "auto-post",
    manualApprovalRequired: safeMode !== "auto-post"
  };
}
