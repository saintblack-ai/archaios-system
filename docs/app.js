import { PRICING_TIERS, getPricingTier } from "../shared/pricing.js";

const NAV_ITEMS = ["Overview", "Intelligence", "Operations", "Settings"];
const MISSION_MODES = ["Growth Mode", "Revenue Mode", "Build Mode", "Intel Mode", "Creator Mode"];
const STORAGE_KEY = "archaiosDocsSavedBriefs";
const AUTH_KEY = "aiAssassinsAuth";
const USERS_KEY = "aiAssassinsUsers";
const REVENUE_EVENTS_KEY = "aiAssassinsRevenueEvents";
const PENDING_CHECKOUT_KEY = "aiAssassinsPendingCheckout";
const REVENUE_FALLBACK = {
  totalRevenue: 0,
  mrr: 0,
  activeSubscriptions: 0,
  failedPayments: 0,
  lastPaymentTimestamp: null,
  revenueStatus: "Prelaunch"
};
const SWARM_FALLBACK = {
  totalAgents: 7,
  activeAgents: 6,
  topPerformers: [
    { name: "launch_agent", score: 92, revenue: 3200 },
    { name: "trend_scout", score: 84, revenue: 1800 },
    { name: "revenue_optimizer", score: 81, revenue: 2600 }
  ],
  revenuePerAgent: [
    { name: "launch_agent", revenue: 3200 },
    { name: "revenue_optimizer", revenue: 2600 },
    { name: "trend_scout", revenue: 1800 }
  ],
  experimentsRunning: 3,
  maxAgents: 50,
  maxTasksPerAgent: 10
};

const FALLBACK = {
  "Growth Mode": {
    overview: "AI demand is clustering around focused operator workflows, so growth wins belong to products that show value immediately and make operator momentum visible.",
    priorities: [
      "Tighten the first-screen promise around one concrete workflow.",
      "Turn the strongest brief output into a public proof asset.",
      "Use fast wins to deepen operator trust and repeat usage."
    ],
    commandNote: "Position ARCHAIOS as an operating advantage rather than a generic assistant.",
    bestNextMove: "Publish one concrete operator use case that shows how ARCHAIOS compresses research-to-decision time.",
    whyNow: "The market is crowded with generic AI language, so clarity and proof are compounding faster than breadth.",
    expectedImpact: "Higher conversion from curious visitors into operators who understand the product in one session.",
    marketIntelligence: {
      opportunity: "Operators are actively testing AI systems that collapse research, planning, and execution into one surface.",
      threat: "Broad AI positioning still risks blending into undifferentiated assistant experiences.",
      recommendation: "Lead with operator outcomes and back them with visible proof.",
      status: "ready"
    },
    actionQueue: [
      { title: "Package the strongest growth workflow into a proof card.", assignedAgent: "growth_agent", result: "Growth proof card drafted and queued for review." },
      { title: "Draft a public-facing sample brief for operators.", assignedAgent: "media_ops_agent", result: "Sample operator brief drafted for distribution." },
      { title: "Refine the primary CTA around operator speed.", assignedAgent: "brief_agent", result: "Primary CTA revised around faster operator decisions." }
    ]
  },
  "Revenue Mode": {
    overview: "Revenue momentum is strongest when intelligence resolves into a clear commercial move with low friction between insight, offer, and follow-through.",
    priorities: [
      "Surface the revenue-critical KPI and decision in one view.",
      "Translate the brief into a pricing, upsell, or conversion move.",
      "Keep the operator path from signal to monetization extremely short."
    ],
    commandNote: "Turn intelligence into monetization actions that are visible and fast to execute.",
    bestNextMove: "Create one revenue play card tied to a pricing, sales, or upsell action from the current brief.",
    whyNow: "The dashboard already exposes revenue context, so the fastest win is turning it into direct operator motion.",
    expectedImpact: "More monetization behavior and a stronger reason for operators to return daily.",
    marketIntelligence: {
      opportunity: "Lean buyers still spend when a product clearly replaces fragmented revenue-adjacent manual work.",
      threat: "Decorative AI experiences lose monetization power when they do not improve conversion or retention.",
      recommendation: "Tie every brief to a revenue action and commercial outcome.",
      status: "ready"
    },
    actionQueue: [
      { title: "Define a monetization move from the current brief.", assignedAgent: "revenue_agent", result: "Revenue move attached to the current operator brief." },
      { title: "Add revenue framing to the command summary.", assignedAgent: "brief_agent", result: "Command summary updated with revenue-forward framing." },
      { title: "Draft a follow-up tied to upsell or conversion.", assignedAgent: "growth_agent", result: "Follow-up drafted for revenue conversion flow." }
    ]
  },
  "Build Mode": {
    overview: "Build momentum is highest when intelligence clearly reveals what to ship next, why it matters, and how it compounds operator trust.",
    priorities: [
      "Turn the dashboard into an execution surface for the next feature.",
      "Promote reliability and traceability as user-visible product strengths.",
      "Make each new capability measurable in operator terms."
    ],
    commandNote: "Use intelligence to prioritize the next build decision, not just summarize conditions.",
    bestNextMove: "Ship one operator-facing workflow step that turns current intelligence into action.",
    whyNow: "The command center already has state, history, and actions, so the next build step compounds immediately.",
    expectedImpact: "Higher user trust and faster product differentiation through visible execution support.",
    marketIntelligence: {
      opportunity: "Teams reward automation products that make orchestration legible and dependable.",
      threat: "Black-box behavior slows adoption of advanced features.",
      recommendation: "Ship operator-visible decision tools that make next action unmistakable.",
      status: "ready"
    },
    actionQueue: [
      { title: "Select the highest-leverage workflow gap from the brief.", assignedAgent: "brief_agent", result: "Workflow gap prioritized for the next build cycle." },
      { title: "Define one operator UI state to close the gap.", assignedAgent: "media_ops_agent", result: "UI state outlined for the next operator flow." },
      { title: "Instrument the action for dashboard-visible impact.", assignedAgent: "growth_agent", result: "Instrumentation plan drafted for command-center visibility." }
    ]
  },
  "Intel Mode": {
    overview: "Decision advantage now comes from turning noisy signals into clear operator moves faster than competitors can interpret them.",
    priorities: [
      "Condense the strongest signal into one decisive recommendation.",
      "Preserve context while reducing interpretation load.",
      "Keep the intelligence loop visible and repeatable."
    ],
    commandNote: "Treat every brief as a command asset that shortens the path from awareness to action.",
    bestNextMove: "Promote the clearest market signal into a top-level command for the operator.",
    whyNow: "Fast-changing AI and media conditions reward systems that reduce hesitation rather than just add information.",
    expectedImpact: "Faster operator response time and stronger trust that ARCHAIOS is driving decisions.",
    marketIntelligence: {
      opportunity: "Teams need intelligence surfaces that translate trends into operational posture.",
      threat: "Raw summaries still create hesitation when they do not resolve into a recommendation.",
      recommendation: "Prioritize decision clarity over data volume.",
      status: "ready"
    },
    actionQueue: [
      { title: "Select the strongest signal in the current brief.", assignedAgent: "brief_agent", result: "Highest-conviction signal promoted for operator review." },
      { title: "Map the signal to one strategic decision.", assignedAgent: "market_intel_agent", result: "Strategic decision recommendation attached to the signal." },
      { title: "Log the outcome so the next brief compounds context.", assignedAgent: "security_sentinel", result: "Decision outcome logged into the ARCHAIOS memory loop." }
    ]
  },
  "Creator Mode": {
    overview: "Creators respond to systems that transform market awareness into content direction, monetization angles, and immediate execution without flattening voice.",
    priorities: [
      "Connect the signal to a publishable angle.",
      "Tie strategy output to growth or monetization.",
      "Keep creativity guided rather than templated."
    ],
    commandNote: "Turn insight into a differentiated creator move with visible upside.",
    bestNextMove: "Convert the strongest signal into one creator-facing angle with monetizable follow-through.",
    whyNow: "Attention windows are short, so creators benefit most when insight becomes a publishing decision quickly.",
    expectedImpact: "More differentiated content and stronger alignment between effort and return.",
    marketIntelligence: {
      opportunity: "Creators want systems that reveal what to say next and how it compounds across channels and products.",
      threat: "Generic AI output reduces distinctiveness and weakens audience trust.",
      recommendation: "Use ARCHAIOS to suggest sharp creator actions tied to monetization.",
      status: "ready"
    },
    actionQueue: [
      { title: "Turn the brief into one strong creator angle.", assignedAgent: "media_ops_agent", result: "Creator angle drafted from the strongest signal." },
      { title: "Connect the angle to an offer or funnel step.", assignedAgent: "revenue_agent", result: "Creator angle tied to a monetization path." },
      { title: "Prepare the first execution move while the signal is fresh.", assignedAgent: "growth_agent", result: "First creator execution move staged for launch." }
    ]
  }
};

const AGENTS = [
  { name: "Brief Agent", key: "brief_agent", detail: "Brief orchestration online" },
  { name: "Market Intel Agent", key: "market_intel_agent", detail: "Signal ingestion synchronized" },
  { name: "Revenue Agent", key: "revenue_agent", detail: "Revenue playbooks synced" },
  { name: "Media Ops Agent", key: "media_ops_agent", detail: "Distribution board synchronized" },
  { name: "Growth Agent", key: "growth_agent", detail: "Growth experiments staged" },
  { name: "Security Sentinel", key: "security_sentinel", detail: "Environment checks stable" }
];

const state = {
  activeView: "Overview",
  missionMode: "Intel Mode",
  lastBriefTimestamp: null,
  revenueStatus: "$0.00",
  revenueSignals: { ...REVENUE_FALLBACK },
  revenueSource: "Fallback",
  revenueEventMarkers: [],
  revenueSnapshot: null,
  savedBriefs: readSavedBriefs(),
  membership: readAuthState(),
  notice: null,
  noticeTone: "info",
  intelStream: [],
  brief: createBrief("Intel Mode"),
  operations: [],
  commandStatus: "Operator Ready",
  swarm: { ...SWARM_FALLBACK }
};

function normalizeTask(mode, task, index) {
  return {
    id: task.id || task.taskId || `${mode.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}-${index}`,
    title: task.title || task.description || `ARCHAIOS task ${index + 1}`,
    assignedAgent: task.assignedAgent || "brief_agent",
    priority: task.priority || (index === 0 ? "high" : index === 1 ? "medium" : "low"),
    status: task.status || "pending",
    result: task.result || `Completed ${task.title || task.description || "task"}.`,
    createdAt: task.createdAt || new Date().toISOString(),
    completedAt: task.completedAt || null
  };
}

function normalizeSavedBrief(entry) {
  const mode = entry.missionMode && FALLBACK[entry.missionMode] ? entry.missionMode : "Intel Mode";
  const fallback = createBrief(mode);
  return {
    id: entry.id || `${Date.now()}-${mode}`,
    savedAt: entry.savedAt || new Date().toISOString(),
    missionMode: mode,
    overview: entry.overview || fallback.overview,
    priorities: Array.isArray(entry.priorities) ? entry.priorities : fallback.priorities,
    commandNote: entry.commandNote || fallback.commandNote,
    bestNextMove: entry.bestNextMove || fallback.bestNextMove,
    whyNow: entry.whyNow || fallback.whyNow,
    expectedImpact: entry.expectedImpact || fallback.expectedImpact,
    marketIntelligence: entry.marketIntelligence || fallback.marketIntelligence,
    actionQueue: Array.isArray(entry.actionQueue)
      ? entry.actionQueue.map((task, index) => normalizeTask(mode, task, index))
      : fallback.actionQueue
  };
}

initialize();

function initialize() {
  hydrateCheckoutState();
  renderNav();
  renderMissionModes();
  attachControls();
  appendStream(`membership_status :: ${membershipLabel()}`);
  refreshRevenueSignals().finally(() => renderAll());
  generateBrief();
  window.setInterval(() => {
    refreshRevenueSignals().finally(() => renderAll());
  }, 60000);
}

function resolveProductConfig() {
  return {
    productName: (document.body.dataset.productName || "AI Assassins Membership").trim(),
    stripePaymentLink: (document.body.dataset.stripePaymentLink || "").trim(),
    checkoutApiUrl: (document.body.dataset.checkoutApiUrl || "").trim(),
    checkoutSuccessUrl: (document.body.dataset.checkoutSuccessUrl || "./dashboard.html?checkout=success").trim(),
    checkoutCancelUrl: (document.body.dataset.checkoutCancelUrl || "./dashboard.html?checkout=cancel").trim()
  };
}

function resolveRevenueConfig() {
  return {
    revenueSummaryUrl: (document.body.dataset.revenueSummaryUrl || "").trim(),
    supabaseUrl: (document.body.dataset.supabaseUrl || "").trim().replace(/\/+$/, ""),
    supabaseAnonKey: (document.body.dataset.supabaseAnonKey || "").trim()
  };
}

function hasPaidAccess() {
  return state.membership?.tier === "paid" || state.membership?.tier === "pro" || state.membership?.tier === "elite";
}

function resolveTierPlan(tierId) {
  return getPricingTier(tierId === "paid" ? "pro" : tierId);
}

function readJsonStorage(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJsonStorage(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function readAuthState() {
  const auth = readJsonStorage(AUTH_KEY, null);
  if (!auth || typeof auth !== "object") {
    return {
      authenticated: false,
      email: "",
      tier: "free",
      subscribedAt: null,
      lastLoginAt: null
    };
  }

  return {
    authenticated: Boolean(auth.authenticated),
    email: String(auth.email || ""),
    tier: auth.tier === "elite" ? "elite" : auth.tier === "pro" || auth.tier === "paid" ? "pro" : "free",
    subscribedAt: auth.subscribedAt || null,
    lastLoginAt: auth.lastLoginAt || null
  };
}

function persistMembership() {
  writeJsonStorage(AUTH_KEY, state.membership);
}

function readUsers() {
  const users = readJsonStorage(USERS_KEY, []);
  return Array.isArray(users) ? users : [];
}

function persistUsers(users) {
  writeJsonStorage(USERS_KEY, users);
}

function readRevenueEvents() {
  const events = readJsonStorage(REVENUE_EVENTS_KEY, []);
  return Array.isArray(events) ? events : [];
}

function persistRevenueEvents(events) {
  writeJsonStorage(REVENUE_EVENTS_KEY, events);
}

function setNotice(message, tone = "info") {
  state.notice = message;
  state.noticeTone = tone;
}

function clearNotice() {
  state.notice = null;
  state.noticeTone = "info";
}

function membershipLabel() {
  if (!state.membership.authenticated) {
    return "Guest";
  }
  const plan = resolveTierPlan(state.membership?.tier || "free");
  return hasPaidAccess() ? `${plan.name} Member` : "Free Member";
}

function upsertUser(email, password, nextFields = {}) {
  const users = readUsers();
  const existingIndex = users.findIndex((user) => String(user.email).toLowerCase() === email.toLowerCase());
  const now = new Date().toISOString();
  const baseUser = existingIndex >= 0
    ? users[existingIndex]
    : {
        email,
        password,
        createdAt: now,
        tier: "free",
        subscribedAt: null
      };

  const nextUser = {
    ...baseUser,
    password: password || baseUser.password,
    updatedAt: now,
    ...nextFields
  };

  if (existingIndex >= 0) {
    users[existingIndex] = nextUser;
  } else {
    users.push(nextUser);
  }

  persistUsers(users);
  return nextUser;
}

function recordRevenueEvent(event) {
  const events = readRevenueEvents();
  if (events.some((entry) => entry.id === event.id)) {
    return;
  }
  events.unshift(event);
  persistRevenueEvents(events.slice(0, 50));
}

function createSimulatedRevenueSummary() {
  const users = readUsers();
  const events = readRevenueEvents();
  const paidUsers = users.filter((user) => hasPaidAccess(user.tier));
  const activeSubscriptions = paidUsers.length;
  const paidEvents = events.filter((event) => event.status === "paid");
  const latestPaidEvent = paidEvents[0] || null;
  const totalRevenue = Number(
    paidEvents.reduce((sum, event) => sum + safeNumber(event.amount, 0), 0).toFixed(2)
  );
  const mrr = Number(
    paidUsers.reduce((sum, user) => sum + resolveTierPlan(user.tier).price, 0).toFixed(2)
  );

  return {
    totalRevenue,
    mrr,
    activeSubscriptions,
    failedPayments: events.filter((event) => event.status === "failed").length,
    lastPaymentTimestamp: latestPaidEvent ? latestPaidEvent.occurred_at : null,
    revenueStatus: activeSubscriptions > 0 ? "Simulated Live" : "Prelaunch",
    recentEvents: events.slice(0, 8)
  };
}

function hydrateCheckoutState() {
  const url = new URL(window.location.href);
  const checkout = url.searchParams.get("checkout");
  const demo = url.searchParams.get("demo");

  if (demo === "1") {
    setNotice("Demo mode enabled. Premium features stay locked until payment is confirmed.", "info");
    state.activeView = "Overview";
  }

  if (checkout === "success") {
    const pending = readJsonStorage(PENDING_CHECKOUT_KEY, null);
    if (pending?.email) {
      const paidAt = new Date().toISOString();
      const nextTier = pending.tier === "elite" ? "elite" : "pro";
      const user = upsertUser(pending.email, pending.password || "", {
        tier: nextTier,
        subscribedAt: paidAt
      });
      state.membership = {
        authenticated: true,
        email: user.email,
        tier: nextTier,
        subscribedAt: paidAt,
        lastLoginAt: paidAt
      };
      persistMembership();
      recordRevenueEvent({
        id: `local-checkout-${pending.startedAt || paidAt}`,
        event_type: "checkout.session.completed",
        amount: resolveTierPlan(nextTier).price,
        revenue_delta: resolveTierPlan(nextTier).price,
        status: "paid",
        occurred_at: paidAt,
        customer_email: user.email
      });
      window.localStorage.removeItem(PENDING_CHECKOUT_KEY);
      setNotice("Payment confirmed. Premium dashboard access is unlocked.", "ok");
      appendStream(`subscription_upgrade :: ${user.email} :: paid`);
    } else {
      setNotice("Stripe returned successfully, but no pending checkout session was found on this browser.", "warn");
    }
  } else if (checkout === "cancel") {
    setNotice("Checkout was canceled. You can keep exploring the demo or subscribe whenever you are ready.", "warn");
  }

  if (checkout || demo) {
    url.searchParams.delete("checkout");
    url.searchParams.delete("demo");
    window.history.replaceState({}, document.title, url.pathname);
  }
}

async function refreshRevenueSignals() {
  const config = resolveRevenueConfig();

  try {
    if (config.revenueSummaryUrl) {
      const response = await fetch(config.revenueSummaryUrl, {
        headers: {
          Accept: "application/json"
        }
      });
      if (response.ok) {
        applyRevenueSignals(await response.json(), "Public Summary Endpoint");
        appendStream("revenue_signal_sync :: live endpoint");
        return;
      }
    }

    if (config.supabaseUrl && config.supabaseAnonKey) {
      const headers = {
        apikey: config.supabaseAnonKey,
        Authorization: `Bearer ${config.supabaseAnonKey}`,
        Accept: "application/json"
      };
      const [summaryResponse, eventsResponse] = await Promise.all([
        fetch(
          `${config.supabaseUrl}/rest/v1/revenue_summary?scope=eq.global&select=scope,total_revenue,mrr,active_subscriptions,failed_payments,last_payment_at,revenue_status,updated_at,source_event_id`,
          { headers }
        ),
        fetch(
          `${config.supabaseUrl}/rest/v1/revenue_events?select=stripe_event_id,event_type,amount,revenue_delta,status,occurred_at,customer_email&order=occurred_at.desc&limit=8`,
          { headers }
        ).catch(() => null)
      ]);

      if (summaryResponse.ok) {
        const payload = await summaryResponse.json();
        const summary = Array.isArray(payload) ? payload[0] : payload;
        const recentEvents = eventsResponse && eventsResponse.ok ? await eventsResponse.json() : [];
        applyRevenueSignals({ ...summary, recentEvents }, "Supabase");
        appendStream("revenue_signal_sync :: supabase");
        return;
      }
    }
  } catch (error) {
    console.error("Revenue signal fetch failed", error);
  }

  state.revenueSignals = createSimulatedRevenueSummary();
  state.revenueSource = "Simulated";
  state.revenueStatus = formatCurrency(state.revenueSignals.mrr);
  appendStream("revenue_signal_sync :: simulated");
}

function safeNumber(value, fallback) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function applyRevenueSignals(payload, sourceLabel) {
  const previousSignals = state.revenueSignals;
  state.revenueSignals = {
    totalRevenue: safeNumber(payload?.total_revenue ?? payload?.totalRevenue, REVENUE_FALLBACK.totalRevenue),
    mrr: safeNumber(payload?.mrr, REVENUE_FALLBACK.mrr),
    activeSubscriptions: safeNumber(payload?.active_subscriptions ?? payload?.activeSubscriptions, REVENUE_FALLBACK.activeSubscriptions),
    failedPayments: safeNumber(payload?.failed_payments ?? payload?.failedPayments, REVENUE_FALLBACK.failedPayments),
    lastPaymentTimestamp: payload?.last_payment_at ?? payload?.lastPaymentTimestamp ?? null,
    revenueStatus: String(payload?.revenue_status ?? payload?.revenueStatus ?? REVENUE_FALLBACK.revenueStatus)
  };
  state.revenueSource = sourceLabel;
  state.revenueStatus = formatCurrency(state.revenueSignals.mrr);
  syncRevenueEventsToIntelStream(payload?.recentEvents, previousSignals);
}

function syncRevenueEventsToIntelStream(events, previousSignals) {
  if (Array.isArray(events) && events.length > 0) {
    const nextMarkers = [];

    events
      .slice()
      .reverse()
      .forEach((event) => {
        const marker = String(event?.stripe_event_id || `${event?.event_type}-${event?.occurred_at}`);
        nextMarkers.push(marker);
        if (state.revenueEventMarkers.includes(marker)) {
          return;
        }

        const amount = safeNumber(event?.revenue_delta ?? event?.amount, 0);
        const amountLabel = amount > 0 ? formatCurrency(amount) : "no revenue delta";
        const status = String(event?.status || "recorded");
        const eventType = String(event?.event_type || "stripe.event");
        appendStream(`revenue_event :: ${eventType} :: ${status} :: ${amountLabel}`);
      });

    state.revenueEventMarkers = nextMarkers.slice(-20);
    state.revenueSnapshot = null;
    return;
  }

  const snapshot = [
    state.revenueSignals.totalRevenue,
    state.revenueSignals.mrr,
    state.revenueSignals.activeSubscriptions,
    state.revenueSignals.failedPayments,
    state.revenueSignals.lastPaymentTimestamp,
    state.revenueSignals.revenueStatus
  ].join("|");

  if (state.revenueSnapshot === snapshot) {
    return;
  }

  const changed =
    !previousSignals ||
    previousSignals.totalRevenue !== state.revenueSignals.totalRevenue ||
    previousSignals.mrr !== state.revenueSignals.mrr ||
    previousSignals.activeSubscriptions !== state.revenueSignals.activeSubscriptions ||
    previousSignals.failedPayments !== state.revenueSignals.failedPayments ||
    previousSignals.lastPaymentTimestamp !== state.revenueSignals.lastPaymentTimestamp ||
    previousSignals.revenueStatus !== state.revenueSignals.revenueStatus;

  state.revenueSnapshot = snapshot;

  if (!changed) {
    return;
  }

  appendStream(
    `revenue_event :: summary_sync :: ${state.revenueSignals.revenueStatus} :: total ${formatCurrency(state.revenueSignals.totalRevenue)} :: mrr ${formatCurrency(state.revenueSignals.mrr)}`
  );
}

function createTask(mode, task, index) {
  return {
    id: `${mode.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}-${index}`,
    title: task.title,
    assignedAgent: task.assignedAgent,
    priority: index === 0 ? "high" : index === 1 ? "medium" : "low",
    status: "pending",
    result: task.result,
    createdAt: new Date().toISOString(),
    completedAt: null
  };
}

function createBrief(mode) {
  const template = FALLBACK[mode];
  return {
    missionMode: mode,
    overview: template.overview,
    priorities: [...template.priorities],
    commandNote: template.commandNote,
    bestNextMove: template.bestNextMove,
    whyNow: template.whyNow,
    expectedImpact: template.expectedImpact,
    marketIntelligence: { ...template.marketIntelligence },
    actionQueue: template.actionQueue.map((task, index) => createTask(mode, task, index))
  };
}

function renderNav() {
  const rail = document.getElementById("nav-rail");
  rail.innerHTML = NAV_ITEMS.map((item) => `
    <button class="${item === state.activeView ? "active" : ""}" data-view="${item}">
      ${item}${!hasPaidAccess() && (item === "Intelligence" || item === "Operations") ? " [Premium]" : ""}
    </button>
  `).join("");

  rail.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeView = button.dataset.view;
      renderAll();
    });
  });
}

function renderMissionModes() {
  const select = document.getElementById("mission-mode");
  select.innerHTML = MISSION_MODES.map((mode) => `<option value="${mode}">${mode}</option>`).join("");
  select.value = state.missionMode;
}

function attachControls() {
  document.getElementById("mission-mode").addEventListener("change", (event) => {
    state.missionMode = event.target.value;
    state.commandStatus = `Mission mode switched to ${state.missionMode}`;
    appendStream(`command_mode_switch :: ${state.missionMode}`);
    renderAll();
  });

  document.getElementById("generate-brief").addEventListener("click", () => generateBrief());
  document.getElementById("save-brief").addEventListener("click", () => saveBrief());
  document.getElementById("hero-subscribe-button").addEventListener("click", () => beginCheckout("pro"));
  document.getElementById("hero-demo-button").addEventListener("click", () => beginCheckout("elite"));

  document.getElementById("command-form").addEventListener("submit", (event) => {
    event.preventDefault();
    parseCommand(document.getElementById("command-input").value);
  });
}

function activateDemo() {
  setNotice("Demo mode enabled. Sign up and subscribe to unlock the premium dashboard.", "info");
  state.commandStatus = "Demo mode active";
  appendStream("demo_mode :: enabled");
  state.activeView = "Overview";
  renderAll();
  document.getElementById("overview-view")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function handleAuthSubmit(event) {
  event.preventDefault();
  const emailInput = document.getElementById("member-email");
  const passwordInput = document.getElementById("member-password");
  const email = String(emailInput?.value || "").trim().toLowerCase();
  const password = String(passwordInput?.value || "").trim();

  if (!email || !password) {
    setNotice("Enter an email and password to create your member login.", "warn");
    renderAll();
    return;
  }

  const users = readUsers();
  const existing = users.find((user) => String(user.email).toLowerCase() === email);
  const now = new Date().toISOString();
  const mode = event.submitter?.dataset.mode || "signup";

  if (mode === "login") {
    if (!existing || existing.password !== password) {
      setNotice("Login failed. Use the same credentials you created on this device.", "warn");
      renderAll();
      return;
    }

    state.membership = {
      authenticated: true,
      email,
      tier: existing.tier === "elite" ? "elite" : existing.tier === "pro" || existing.tier === "paid" ? "pro" : "free",
      subscribedAt: existing.subscribedAt || null,
      lastLoginAt: now
    };
    persistMembership();
    upsertUser(email, password, { lastLoginAt: now });
    setNotice(hasPaidAccess() ? "Welcome back. Premium access is ready." : "Logged in. Subscribe to unlock premium access.", "ok");
    appendStream(`member_login :: ${email}`);
    renderAll();
    return;
  }

  const user = upsertUser(email, password, { lastLoginAt: now });
  state.membership = {
    authenticated: true,
    email: user.email,
    tier: user.tier === "elite" ? "elite" : user.tier === "pro" || user.tier === "paid" ? "pro" : "free",
    subscribedAt: user.subscribedAt || null,
    lastLoginAt: now
  };
  persistMembership();
  setNotice("Account created. You can subscribe now to unlock the premium dashboard.", "ok");
  appendStream(`member_signup :: ${email}`);
  refreshRevenueSignals().finally(() => renderAll());
}

function logoutMembership() {
  state.membership = {
    authenticated: false,
    email: "",
    tier: "free",
    subscribedAt: null,
    lastLoginAt: null
  };
  persistMembership();
  setNotice("You have been signed out on this browser.", "info");
  appendStream("member_logout :: browser_session");
  renderAll();
}

async function beginCheckout(nextTier = "pro") {
  const config = resolveProductConfig();
  const requestedTier = nextTier === "elite" ? "elite" : "pro";
  const selectedPlan = resolveTierPlan(requestedTier);

  if (!state.membership.authenticated) {
    setNotice("Create your member login first, then subscribe.", "warn");
    renderAll();
    document.getElementById("member-email")?.focus();
    return;
  }

  if (hasPaidAccess()) {
    setNotice("Premium access is already unlocked for this member.", "ok");
    renderAll();
    return;
  }

  writeJsonStorage(PENDING_CHECKOUT_KEY, {
    email: state.membership.email,
    tier: requestedTier,
    startedAt: new Date().toISOString()
  });

  appendStream(`checkout_started :: ${state.membership.email} :: ${requestedTier}`);

  if (config.checkoutApiUrl) {
    try {
      const response = await fetch(config.checkoutApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({ tier: requestedTier })
      });
      const payload = await response.json();
      if (!response.ok || !payload?.url) {
        throw new Error(payload?.error || "Unable to create checkout session.");
      }
      window.location.href = payload.url;
      return;
    } catch (error) {
      console.error(error);
      setNotice("Checkout API failed, so the dashboard will use the Stripe payment link instead.", "warn");
    }
  }

  if (config.stripePaymentLink) {
    window.location.href = config.stripePaymentLink;
    return;
  }

  setNotice(`No Stripe checkout link is configured yet for ${selectedPlan.name}. Add one in the page data attributes.`, "warn");
  renderAll();
}

function generateBrief() {
  const timestamp = new Date().toISOString();
  state.brief = createBrief(state.missionMode);
  state.operations = state.brief.actionQueue.map((task) => ({ ...task, createdAt: timestamp }));
  state.lastBriefTimestamp = timestamp;
  state.commandStatus = "Brief refreshed";
  appendStream(`brief_run_started :: ${state.missionMode}`);
  appendStream(`brief_run_completed :: ${state.brief.bestNextMove}`);
  appendStream(`market_intel_completed :: ${state.brief.marketIntelligence.opportunity}`);
  renderAll();
}

function saveBrief() {
  const savedAt = state.lastBriefTimestamp || new Date().toISOString();
  const entry = { id: `${savedAt}-${state.brief.missionMode}`, savedAt, ...structuredClone(state.brief) };
  state.savedBriefs = [entry, ...state.savedBriefs.filter((item) => item.id !== entry.id)];
  writeSavedBriefs(state.savedBriefs);
  state.commandStatus = "Brief archived";
  appendStream(`brief_archive :: saved ${state.brief.missionMode}`);
  renderAll();
}

function executeTask(taskId) {
  const task = state.operations.find((item) => item.id === taskId);
  if (!task || task.status !== "pending") {
    appendStream(`task_execution_blocked :: ${taskId}`);
    renderAll();
    return;
  }

  task.status = "running";
  task.createdAt = new Date().toISOString();
  syncBriefQueue();
  appendStream(`task_execution_started :: ${task.assignedAgent} :: ${task.title}`);
  renderAll();

  window.setTimeout(() => {
    task.status = "completed";
    task.completedAt = new Date().toISOString();
    syncBriefQueue();
    appendStream(`task_execution_completed :: ${task.assignedAgent} :: ${task.result}`);
    renderAll();
  }, 1000);
}

function queueScanTask() {
  const task = {
    id: `scan-${Date.now()}`,
    title: "Run autonomous market scan for emerging AI opportunities.",
    assignedAgent: "market_intel_agent",
    priority: "medium",
    status: "pending",
    result: "Autonomous market scan completed and queued in the Intel Stream.",
    createdAt: new Date().toISOString(),
    completedAt: null
  };
  state.operations = [task, ...state.operations];
  syncBriefQueue();
  state.commandStatus = "Scan task queued";
  appendStream(`command_queue_scan :: ${task.title}`);
  renderAll();
}

function parseCommand(raw) {
  const command = raw.trim();
  if (!command) {
    return;
  }

  const normalized = command.toLowerCase();
  document.getElementById("command-input").value = "";

  if (normalized === "generate brief") {
    generateBrief();
    return;
  }

  if (normalized === "queue scan") {
    queueScanTask();
    return;
  }

  if (normalized === "show tasks") {
    state.activeView = "Operations";
    state.commandStatus = `Viewing ${state.operations.length} tasks`;
    appendStream(`command_show_tasks :: ${state.operations.length} task(s)`);
    renderAll();
    return;
  }

  if (normalized.startsWith("switch mission mode")) {
    const nextMode = MISSION_MODES.find((mode) => normalized.includes(mode.toLowerCase().replace(" mode", ""))) || null;
    if (nextMode) {
      state.missionMode = nextMode;
      document.getElementById("mission-mode").value = nextMode;
      state.commandStatus = `Mission mode switched to ${nextMode}`;
      appendStream(`command_mode_switch :: ${nextMode}`);
      renderAll();
      return;
    }
  }

  appendStream(`command_unknown :: ${command}`);
  state.commandStatus = "Command not recognized";
  renderAll();
}

function syncBriefQueue() {
  state.brief.actionQueue = state.operations.map((task) => ({ ...task }));
}

function loadSavedBrief(id) {
  const saved = state.savedBriefs.find((item) => item.id === id);
  if (!saved) {
    return;
  }
  state.brief = normalizeSavedBrief(structuredClone(saved));
  state.missionMode = saved.missionMode;
  state.lastBriefTimestamp = saved.savedAt;
  state.operations = saved.actionQueue.map((task, index) => normalizeTask(saved.missionMode, task, index));
  document.getElementById("mission-mode").value = state.missionMode;
  state.commandStatus = `Loaded saved brief for ${state.missionMode}`;
  appendStream(`brief_archive :: loaded ${saved.missionMode}`);
  renderAll();
}

function deleteSavedBrief(id) {
  state.savedBriefs = state.savedBriefs.filter((item) => item.id !== id);
  writeSavedBriefs(state.savedBriefs);
  state.commandStatus = "Saved brief removed";
  renderAll();
}

function appendStream(line) {
  state.intelStream = [`$ ${timestampLabel(new Date().toISOString())} :: ${line}`, ...state.intelStream].slice(0, 20);
}

function renderAll() {
  renderNav();
  renderStatusBar();
  renderSignalStrip();
  renderMembershipPanel();
  renderPricingGrid();
  renderOfferGrid();
  renderPremiumAccessPanel();
  renderOverview();
  renderViews();
  document.body.dataset.membership = hasPaidAccess() ? "paid" : state.membership.authenticated ? "free" : "guest";
}

function renderMembershipPanel() {
  const currentPlan = resolveTierPlan(state.membership?.tier || "free");
  const panel = document.getElementById("membership-panel");

  if (state.membership.authenticated) {
    panel.innerHTML = `
      <p class="label">Member Console</p>
      <h3 class="member-title">${hasPaidAccess() ? "Premium unlocked" : "Member account ready"}</h3>
      <p class="member-copy">
        ${hasPaidAccess()
          ? `Logged in as ${state.membership.email}. Premium tools, dashboards, and operator workflows are available.`
          : `Logged in as ${state.membership.email}. Upgrade to Pro or Elite to unlock the premium dashboard.`}
      </p>
      <div class="premium-grid">
        <article class="premium-card">
          <p class="label">Access</p>
          <p class="value">${membershipLabel()}</p>
          <p class="hint">${hasPaidAccess() ? "Paid subscription active" : "Awaiting payment"}</p>
        </article>
        <article class="premium-card">
          <p class="label">Plan</p>
          <p class="value">${currentPlan.displayPrice}</p>
          <p class="hint">${currentPlan.name} tier</p>
        </article>
      </div>
      <div class="stack-actions">
        <button class="button primary-button" id="member-subscribe-button" type="button">${hasPaidAccess() ? "Premium Active" : "Upgrade to Pro"}</button>
        <button class="button button-secondary" id="member-logout-button" type="button">Log Out</button>
      </div>
      ${state.notice ? `<div class="notice ${state.noticeTone}">${state.notice}</div>` : ""}
    `;

    document.getElementById("member-subscribe-button").addEventListener("click", () => beginCheckout());
    document.getElementById("member-logout-button").addEventListener("click", () => logoutMembership());
    return;
  }

  panel.innerHTML = `
    <p class="label">Sign Up Or Log In</p>
    <h3 class="member-title">Start with a free member login</h3>
    <p class="member-copy">
      Create your login on this browser, then subscribe to unlock the paid AI Assassins command layer.
    </p>
    <form class="member-form" id="member-form">
      <input class="input" id="member-email" type="email" placeholder="Email address" />
      <input class="input" id="member-password" type="password" placeholder="Password" />
      <div class="member-actions">
        <button class="button primary-button" data-mode="signup" type="submit">Create Account</button>
        <button class="button button-secondary" data-mode="login" type="submit">Log In</button>
      </div>
    </form>
    ${state.notice ? `<div class="notice ${state.noticeTone}">${state.notice}</div>` : ""}
  `;

  document.getElementById("member-form").addEventListener("submit", handleAuthSubmit);
}

function renderPricingGrid() {
  const pricingGrid = document.getElementById("pricing-grid");

  pricingGrid.innerHTML = PRICING_TIERS.map((plan) => `
    <article class="offer-card ${plan.id === "elite" ? "dark" : ""}">
      <p class="label">${plan.name}</p>
      <p class="price-tag">${plan.displayPrice}</p>
      <ul class="feature-list">
        ${plan.features.map((feature) => `<li>${feature}</li>`).join("")}
      </ul>
      <div class="stack-actions">
        <button
          class="button ${plan.id === "free" ? "button-secondary" : "primary-button"}"
          id="pricing-${plan.id}-button"
          type="button"
          ${plan.id === "free" ? "disabled" : ""}
        >
          ${plan.id === "free" ? "Current Free Tier" : `Upgrade to ${plan.name}`}
        </button>
      </div>
    </article>
  `).join("");

  document.getElementById("pricing-pro-button")?.addEventListener("click", () => beginCheckout("pro"));
  document.getElementById("pricing-elite-button")?.addEventListener("click", () => beginCheckout("elite"));
}

function renderOfferGrid() {
  const offerGrid = document.getElementById("offer-grid");
  const users = readUsers();
  const proPlan = getPricingTier("pro");
  const elitePlan = getPricingTier("elite");

  offerGrid.innerHTML = `
    <article class="offer-card dark">
      <p class="label">Primary Offer</p>
      <h3 class="member-title">ARCHAIOS Intelligence Access</h3>
      <p class="member-copy">Daily intelligence, AI tools access, and a premium command dashboard for operators who want real leverage.</p>
      <ul class="feature-list">
        <li>${proPlan.features[0]}</li>
        <li>${proPlan.features[2]}</li>
        <li>${elitePlan.features[0]}</li>
      </ul>
    </article>
    <article class="offer-card">
      <p class="label">Upgrade Paths</p>
      <p class="price-tag">${proPlan.displayPrice} <span>and</span> ${elitePlan.displayPrice}</p>
      <p class="hint">Free stays in preview mode. Pro unlocks the full dashboard. Elite adds priority signals.</p>
      <div class="stack-actions">
        <button class="button primary-button" id="offer-pro-button" type="button">Upgrade to Pro</button>
        <button class="button button-secondary" id="offer-elite-button" type="button">Upgrade to Elite</button>
      </div>
    </article>
    <article class="offer-card">
      <p class="label">Funnel Snapshot</p>
      <p class="signal-value">${users.length}</p>
      <p class="hint">Local member signups captured on this browser</p>
      <ul class="mini-list">
        <li>${state.revenueSignals.activeSubscriptions} active subscriptions</li>
        <li>${formatCurrency(state.revenueSignals.mrr)} recurring revenue</li>
        <li>${state.revenueSource} revenue data source</li>
      </ul>
    </article>
  `;

  document.getElementById("offer-pro-button").addEventListener("click", () => beginCheckout("pro"));
  document.getElementById("offer-elite-button").addEventListener("click", () => beginCheckout("elite"));
}

function renderPremiumAccessPanel() {
  const panel = document.getElementById("premium-access-panel");
  const currentPlan = resolveTierPlan(state.membership?.tier || "free");
  const elitePlan = resolveTierPlan("elite");

  if (hasPaidAccess()) {
    panel.innerHTML = `
      <div class="premium-shell">
        <p class="label">Premium Dashboard</p>
        <p class="signal-value">Unlocked</p>
        <p class="hint">Your paid membership opens the intelligence view, operations board, and premium command workflows.</p>
        <div class="premium-grid">
          <article class="premium-card">
            <p class="label">Intelligence</p>
            <p class="value">Live</p>
            <p class="hint">Mode-aware premium briefs</p>
          </article>
          <article class="premium-card">
            <p class="label">Operations</p>
            <p class="value">Live</p>
            <p class="hint">Execution queue and task states</p>
          </article>
          <article class="premium-card">
            <p class="label">Billing</p>
            <p class="value">${currentPlan.displayPrice}</p>
            <p class="hint">Current monthly plan</p>
          </article>
        </div>
      </div>
    `;
    return;
  }

  panel.innerHTML = `
    <div class="premium-shell locked">
      <p class="label">Locked Features</p>
      <p class="signal-value">Subscribe To Unlock</p>
      <p class="hint">The premium dashboard stays locked until payment is complete. Demo mode shows the surface but not paid access.</p>
      <div class="premium-grid">
        <article class="premium-card">
          <p class="label">Premium Intelligence</p>
          <p class="value">Locked</p>
          <p class="hint">Advanced briefs and operator recommendations</p>
        </article>
        <article class="premium-card">
          <p class="label">Operations Board</p>
          <p class="value">Locked</p>
          <p class="hint">Execution workflows reserved for members</p>
        </article>
        <article class="premium-card">
          <p class="label">Membership</p>
          <p class="value">${elitePlan.displayPrice}</p>
          <p class="hint">Upgrade for real-time signals</p>
        </article>
      </div>
      <div class="stack-actions">
        <button class="button primary-button" id="premium-subscribe-button" type="button">Upgrade to Pro</button>
        <button class="button button-secondary" id="premium-demo-button" type="button">Upgrade to Elite</button>
      </div>
    </div>
  `;

  document.getElementById("premium-subscribe-button").addEventListener("click", () => beginCheckout("pro"));
  document.getElementById("premium-demo-button").addEventListener("click", () => beginCheckout("elite"));
}

function renderStatusBar() {
  const users = readUsers();
  const bar = document.getElementById("status-bar");
  const items = [
    { label: "Product", value: resolveProductConfig().productName },
    { label: "Access", value: membershipLabel() },
    { label: "Mission Mode", value: state.missionMode },
    { label: "MRR", value: formatCurrency(state.revenueSignals.mrr) },
    { label: "Members", value: String(users.length) },
    { label: "Sync Status", value: state.revenueSource }
  ];

  bar.innerHTML = items.map((item) => `
    <article class="status-pill">
      <p class="label">${item.label}</p>
      <p class="status-value">${item.value}</p>
    </article>
  `).join("");
}

function renderSignalStrip() {
  const strip = document.getElementById("signal-strip");
  const freshness = state.lastBriefTimestamp ? `${Math.max(1, Math.round((Date.now() - Date.parse(state.lastBriefTimestamp)) / 60000))} min ago` : "Awaiting brief";
  const items = [
    { label: "Revenue", value: formatCurrency(state.revenueSignals.totalRevenue), hint: `${state.revenueSignals.revenueStatus} · ${state.revenueSource}` },
    { label: "Subscriptions", value: String(state.revenueSignals.activeSubscriptions), hint: "Active paid members" },
    { label: "Intel Freshness", value: freshness, hint: "Latest brief age" },
    { label: "Queue Load", value: `${state.operations.filter((task) => task.status === "pending").length} pending`, hint: "Action queue pressure" },
    { label: "Operator Status", value: state.commandStatus, hint: state.notice || "Command layer state", accent: true },
    { label: "Last Payment", value: state.revenueSignals.lastPaymentTimestamp ? timestampLabel(state.revenueSignals.lastPaymentTimestamp) : "None yet", hint: "Latest recorded payment" }
  ];

  strip.innerHTML = items.map((item) => `
    <article class="signal-card ${item.accent ? "accent" : ""}">
      <p class="label">${item.label}</p>
      <p class="signal-value">${item.value}</p>
      <p class="hint">${item.hint}</p>
    </article>
  `).join("");
}

function renderOverview() {
  const overviewCards = document.getElementById("overview-cards");
  const config = resolveProductConfig();
  const users = readUsers();
  const cards = [
    ["Offer", "ARCHAIOS Access", "Free, Pro, and Elite intelligence tiers"],
    ["Price", getPricingTier("pro").displayPrice, "Pro unlocks the full dashboard"],
    ["Member State", membershipLabel(), hasPaidAccess() ? "Premium dashboard unlocked" : "Create login and subscribe to unlock"],
    ["Captured Members", String(users.length), "Local browser signups tracked"],
    ["Next Conversion Move", state.brief.bestNextMove, state.brief.expectedImpact],
    ["Intel Stream", `${state.intelStream.length} events`, "Live ARCHAIOS activity log"]
  ];

  overviewCards.innerHTML = cards.map(([label, value, hint]) => `
    <article class="card">
      <p class="label">${label}</p>
      <p class="signal-value">${value}</p>
      <p class="hint">${hint}</p>
    </article>
  `).join("");

  const revenueSignalsPanel = document.getElementById("revenue-signals-panel");
  const revenueCards = [
    ["Total Revenue", formatCurrency(state.revenueSignals.totalRevenue), `${state.revenueSource} revenue total`],
    ["MRR", formatCurrency(state.revenueSignals.mrr), "Monthly recurring revenue"],
    ["Active Subscriptions", String(state.revenueSignals.activeSubscriptions), "Live or simulated paid member count"],
    ["Failed Payments", String(state.revenueSignals.failedPayments), "Payment failures detected"],
    ["Last Payment", state.revenueSignals.lastPaymentTimestamp ? timestampLabel(state.revenueSignals.lastPaymentTimestamp) : "No payment yet", "Most recent successful payment"],
    ["Revenue Status", state.revenueSignals.revenueStatus, `Stripe + Supabase revenue state · ${state.revenueSource}`]
  ];

  revenueSignalsPanel.innerHTML = revenueCards.map(([label, value, hint]) => `
    <article class="card">
      <p class="label">${label}</p>
      <p class="signal-value">${value}</p>
      <p class="hint">${hint}</p>
    </article>
  `).join("");

  const decisionPanel = document.getElementById("decision-panel");
  decisionPanel.innerHTML = `
    <p class="label">Decision Engine</p>
    <h3 class="decision-title">${state.brief.bestNextMove}</h3>
    <div class="decision-metrics">
      <article class="decision-metric">
        <p class="label">Why Now</p>
        <p class="decision-body">${state.brief.whyNow}</p>
      </article>
      <article class="decision-metric">
        <p class="label">Expected Impact</p>
        <p class="decision-body">${state.brief.expectedImpact}</p>
      </article>
    </div>
    <div class="actions">
      <button class="button primary-button" id="decision-execute">Execute Primary Move</button>
      <button class="button button-secondary" id="decision-refresh">Refresh Brief</button>
    </div>
    <div class="decision-footer">
      <span class="badge ${state.operations.some((task) => task.status === "running") ? "running" : "ready"}">
        ${state.operations.some((task) => task.status === "running") ? "Executing" : "Ready"}
      </span>
      <span class="hint">Top opportunity: ${state.brief.marketIntelligence.opportunity}</span>
    </div>
  `;

  document.getElementById("decision-execute").addEventListener("click", () => {
    const nextTask = state.operations.find((task) => task.status === "pending");
    if (nextTask) {
      executeTask(nextTask.id);
    } else {
      appendStream("task_execution_blocked :: no pending task available");
      renderAll();
    }
  });

  document.getElementById("decision-refresh").addEventListener("click", () => generateBrief());

  renderIntelConsole(document.getElementById("intel-stream-panel"), "ARCHAIOS://console");
  renderAgentGrid();
  renderSwarmControlPanel();
}

function renderAgentGrid() {
  const panel = document.getElementById("agent-status-panel");
  panel.innerHTML = AGENTS.map((agent) => {
    const activeTask = state.operations.find((task) => task.assignedAgent === agent.key && task.status !== "completed");
    const status = activeTask ? activeTask.status : "ready";
    return `
      <article class="agent-node">
        <div class="agent-node-header">
          <p class="label">${agent.name}</p>
          <span class="badge ${status}">${status}</span>
        </div>
        <p class="agent-node-value">${activeTask ? activeTask.title : agent.detail}</p>
        <p class="hint">${activeTask ? `Tracking ${activeTask.assignedAgent}` : agent.detail}</p>
      </article>
    `;
  }).join("");
}

function renderSwarmControlPanel() {
  const panel = document.getElementById("swarm-control-panel");
  panel.innerHTML = [
    ["Total Agents", String(state.swarm.totalAgents), "Registered across the self-replicating swarm"],
    ["Active Agents", String(state.swarm.activeAgents), "Currently eligible for task assignment"],
    ["Experiments Running", String(state.swarm.experimentsRunning), "Live experiment loops in motion"],
    [
      "Top Performers",
      state.swarm.topPerformers.map((agent) => `${agent.name} (${agent.score})`).join(" / "),
      "Best-performing agents prioritized first"
    ],
    [
      "Revenue Per Agent",
      state.swarm.revenuePerAgent.map((agent) => `${agent.name}: ${formatCurrency(agent.revenue)}`).join(" / "),
      "Latest revenue impact by agent"
    ],
    [
      "Safety Controls",
      `MAX_AGENTS ${state.swarm.maxAgents} / MAX_TASKS_PER_AGENT ${state.swarm.maxTasksPerAgent}`,
      "Runaway execution prevention limits"
    ]
  ].map(([label, value, hint]) => `
    <article class="card">
      <p class="label">${label}</p>
      <p class="signal-value">${value}</p>
      <p class="hint">${hint}</p>
    </article>
  `).join("");
}

function renderViews() {
  ["overview", "intelligence", "decision", "operations", "saved", "settings"].forEach((key) => {
    const map = {
      Overview: "overview",
      Intelligence: "intelligence",
      "Decision Engine": "decision",
      Operations: "operations",
      "Saved Briefs": "saved",
      Settings: "settings"
    };
    document.getElementById(`${key}-view`).classList.toggle("hidden", map[state.activeView] !== key);
  });

  if (hasPaidAccess()) {
    document.getElementById("intelligence-view-panel").textContent = [
      `Mission Mode: ${state.brief.missionMode}`,
      "",
      state.brief.overview,
      "",
      "Mission Priorities:",
      ...state.brief.priorities.map((priority, index) => `${index + 1}. ${priority}`)
    ].join("\n");
  } else {
    document.getElementById("intelligence-view-panel").textContent = [
      "Premium intelligence is locked.",
      "",
      "Create your member login, complete payment, and return from Stripe to unlock this view.",
      "",
      `Current plan: ${membershipLabel()}`,
      `Upgrade path: ${getPricingTier("pro").displayPrice} or ${getPricingTier("elite").displayPrice}`
    ].join("\n");
  }

  document.getElementById("decision-view-panel").innerHTML = `
    <p class="label">Best Next Move</p>
    <h3 class="decision-title">${state.brief.bestNextMove}</h3>
    <div class="decision-metrics">
      <article class="decision-metric">
        <p class="label">Why Now</p>
        <p class="decision-body">${state.brief.whyNow}</p>
      </article>
      <article class="decision-metric">
        <p class="label">Expected Impact</p>
        <p class="decision-body">${state.brief.expectedImpact}</p>
      </article>
    </div>
  `;

  document.getElementById("market-intel-view-panel").textContent = hasPaidAccess()
    ? [
        "Market Intelligence",
        "",
        `Opportunity: ${state.brief.marketIntelligence.opportunity}`,
        `Threat: ${state.brief.marketIntelligence.threat}`,
        `Recommendation: ${state.brief.marketIntelligence.recommendation}`,
        "Status: Ready"
      ].join("\n")
    : [
        "Premium intelligence preview locked.",
        "",
        "Subscribe to unlock detailed opportunity, threat, and recommendation output.",
        "",
        `Source: ${state.revenueSource}`
      ].join("\n");

  renderOperationsBoard();
  renderSavedBriefs();
  renderIntelConsole(document.getElementById("operations-stream-panel"), "ARCHAIOS://ops");

  document.getElementById("settings-panel").textContent = [
    "GitHub Pages Runtime",
    "",
    "Source: docs/dashboard.html",
    "Root Redirect: docs/index.html",
    "404 Recovery: docs/404.html",
    "State: docs/app.js",
    "Style: docs/styles.css",
    "Shared Pricing: shared/pricing.js",
    `Stripe Payment Link: ${resolveProductConfig().stripePaymentLink ? "configured" : "missing"}`,
    "Revenue: configure body[data-revenue-summary-url] or Supabase body data attrs for live data",
    "",
    "This static dashboard now runs as a simple membership funnel."
  ].join("\n");
}

function renderOperationsBoard() {
  const board = document.getElementById("operations-board");
  if (!hasPaidAccess()) {
    board.innerHTML = `
      <article class="card operation-card">
        <p class="label">Premium Operations</p>
        <p class="value">Locked</p>
        <p class="hint">Subscribe to unlock the live execution queue, task actions, and premium operations board.</p>
      </article>
    `;
    return;
  }

  board.innerHTML = state.operations.length
    ? state.operations.map((task) => `
        <article class="card operation-card">
          <p class="label">Task ${task.id}</p>
          <p class="value">${task.title}</p>
          <p class="hint">Assigned Agent: ${task.assignedAgent}</p>
          <p class="hint">Priority: ${task.priority}</p>
          <p class="hint">Created: ${timestampLabel(task.createdAt)}</p>
          <p class="hint">Completed: ${task.completedAt ? timestampLabel(task.completedAt) : "Awaiting completion"}</p>
          <div class="actions">
            <span class="badge ${task.status}">${task.status}</span>
            <button class="button" ${task.status !== "pending" ? "disabled" : ""} data-task="${task.id}">
              ${task.status === "pending" ? "Execute" : task.status === "running" ? "Running" : "Completed"}
            </button>
          </div>
          <p class="hint">Result: ${task.status === "completed" ? task.result : "Awaiting execution"}</p>
        </article>
      `).join("")
    : `<article class="card"><p class="label">ARCHAIOS Operations Board</p><p class="hint">Generate a brief to create executable operations.</p></article>`;

  board.querySelectorAll("[data-task]").forEach((button) => {
    button.addEventListener("click", () => executeTask(button.dataset.task));
  });
}

function renderSavedBriefs() {
  const panel = document.getElementById("saved-briefs-panel");
  panel.innerHTML = state.savedBriefs.length
    ? state.savedBriefs.map((saved) => `
        <article class="card">
          <p class="label">Saved Brief</p>
          <p class="hint">${timestampLabel(saved.savedAt)}</p>
          <p class="hint">${saved.missionMode}</p>
          <p class="hint">${saved.overview.split("\n")[0]}</p>
          <div class="actions">
            <button class="button" data-load="${saved.id}">Load</button>
            <button class="button button-secondary" data-delete="${saved.id}">Delete</button>
          </div>
        </article>
      `).join("")
    : `<article class="card"><p class="label">Saved Briefs</p><p class="hint">No saved briefs yet.</p></article>`;

  panel.querySelectorAll("[data-load]").forEach((button) => {
    button.addEventListener("click", () => loadSavedBrief(button.dataset.load));
  });
  panel.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", () => deleteSavedBrief(button.dataset.delete));
  });
}

function renderIntelConsole(container, prompt) {
  container.innerHTML = `
    <div class="terminal-header">Intel Stream</div>
    <div class="console-prompt">${prompt}</div>
    ${state.intelStream.map((line) => `<div class="stream-line">${line}</div>`).join("")}
  `;
}

function timestampLabel(value) {
  return new Date(value).toLocaleString();
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(Number(value || 0));
}

function readSavedBriefs() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map((entry) => normalizeSavedBrief(entry)) : [];
  } catch {
    return [];
  }
}

function writeSavedBriefs(savedBriefs) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedBriefs));
}
