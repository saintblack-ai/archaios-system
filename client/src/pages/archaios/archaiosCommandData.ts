import supabase, { isSupabaseEnabled } from "../../lib/supabase";

export type CommandStatus = "green" | "amber" | "red";

export type CommandMetric = {
  label: string;
  value: string;
  detail: string;
  status?: CommandStatus;
};

export type CommandItem = {
  title: string;
  detail: string;
  status?: CommandStatus;
};

export type CommandDivision = {
  id: string;
  name: string;
  callSign: string;
  mission: string;
  status: CommandStatus;
  metrics: CommandMetric[];
  items: CommandItem[];
};

export type ExecutiveCommand = {
  missionStatus: string;
  dailySitrep: string;
  priorities: CommandItem[];
  activeProjects: CommandItem[];
  strategicRisks: CommandItem[];
};

export type ArchaiosCommandSnapshot = {
  generatedAt: string;
  source: "supabase" | "fallback";
  executive: ExecutiveCommand;
  divisions: CommandDivision[];
};

const fallbackSnapshot: ArchaiosCommandSnapshot = {
  generatedAt: new Date().toISOString(),
  source: "fallback",
  executive: {
    missionStatus: "Archaios Command Dashboard V1 online in local fallback mode.",
    dailySitrep:
      "Build priority is the command dashboard shell, Supabase schema, and first operational data model for ecosystem visibility.",
    priorities: [
      {
        title: "Launch command center route",
        detail: "Expose /archaios as the central operational dashboard for all divisions.",
        status: "green"
      },
      {
        title: "Wire Supabase tables",
        detail: "Apply command-center schema and replace fallback values with live division records.",
        status: "amber"
      },
      {
        title: "Protect paid checkout",
        detail: "Keep signed-out users from starting paid checkout in AI Assassins.",
        status: "green"
      }
    ],
    activeProjects: [
      {
        title: "Archaios Command Dashboard V1",
        detail: "React, TypeScript, Supabase-ready dashboard for executive command.",
        status: "green"
      },
      {
        title: "AI Assassins production revenue path",
        detail: "Subscription, Stripe, auth, and system health panels remain launch-critical.",
        status: "amber"
      },
      {
        title: "Blackburn Legacy Archive inventory",
        detail: "First vault indexes and preservation score model are ready for database ingestion.",
        status: "amber"
      }
    ],
    strategicRisks: [
      {
        title: "Fragmented data",
        detail: "Division records must move from documents into structured Supabase tables.",
        status: "amber"
      },
      {
        title: "Founder dependency",
        detail: "Operational knowledge still needs templates, ownership records, and backup routines.",
        status: "amber"
      },
      {
        title: "Production secrets",
        detail: "Stripe, Supabase service role, and backend environment variables must be verified before scale.",
        status: "red"
      }
    ]
  },
  divisions: [
    {
      id: "ai-assassins",
      name: "AI Assassins Division",
      callSign: "Revenue Engine",
      mission: "Convert intelligence workflows into recurring SaaS revenue.",
      status: "amber",
      metrics: [
        { label: "Subscription Count", value: "Pending live sync", detail: "Read from subscriptions table.", status: "amber" },
        { label: "Revenue", value: "$0 fallback", detail: "Replace with Stripe MRR after webhook sync.", status: "amber" },
        { label: "Stripe Status", value: "Needs verification", detail: "Confirm checkout and webhook events.", status: "red" },
        { label: "User Growth", value: "Tracked", detail: "Use profiles, leads, and growth events.", status: "green" },
        { label: "System Health", value: "Health endpoint first", detail: "/api/health is the first diagnostic.", status: "green" }
      ],
      items: [
        { title: "Checkout control", detail: "POST /api/stripe/checkout requires Supabase bearer token.", status: "green" },
        { title: "Webhook alignment", detail: "Keep profiles.tier aligned with active subscription access.", status: "amber" }
      ]
    },
    {
      id: "qx-technology",
      name: "QX Technology Division",
      callSign: "Research Lab",
      mission: "Maintain technical concepts, research notes, inventions, and roadmaps.",
      status: "green",
      metrics: [
        { label: "Research Projects", value: "4 tracked", detail: "AI, cybersecurity, autonomy, forecasting.", status: "green" },
        { label: "Active Concepts", value: "12 candidate concepts", detail: "Ready for scoring and technical specs.", status: "green" },
        { label: "Technical Notes", value: "Needs indexing", detail: "Connect notebook and PDF records.", status: "amber" },
        { label: "Development Roadmap", value: "V1 created", detail: "Roadmap panel receives project rows.", status: "green" }
      ],
      items: [
        { title: "Research taxonomy", detail: "Normalize concepts by domain, maturity, impact, and evidence.", status: "green" },
        { title: "Technical spec pipeline", detail: "Promote high-value notes into implementation specs.", status: "amber" }
      ]
    },
    {
      id: "saint-black-media",
      name: "Saint Black Media",
      callSign: "IP Engine",
      mission: "Track albums, books, scripts, visual projects, publishing status, and rights.",
      status: "amber",
      metrics: [
        { label: "Albums", value: "Catalog pending", detail: "Add projects with master files and release status.", status: "amber" },
        { label: "Books", value: "Published assets found", detail: "Existing books should be tied to archive records.", status: "green" },
        { label: "Scripts", value: "Pipeline empty", detail: "Add concept, draft, production, published statuses.", status: "amber" },
        { label: "Visual Projects", value: "Inventory pending", detail: "Connect covers, art, and campaign graphics.", status: "amber" },
        { label: "Publishing Status", value: "Manual", detail: "Use media_projects table for releases.", status: "amber" }
      ],
      items: [
        { title: "IP register", detail: "Attach rights status, source files, and publishing links to every media asset.", status: "amber" },
        { title: "Release calendar", detail: "Create monthly media production and publication cadence.", status: "amber" }
      ]
    },
    {
      id: "city-zoo",
      name: "City Zoo Division",
      callSign: "Culture Commerce",
      mission: "Manage products, campaigns, marketing tasks, and brand metrics.",
      status: "amber",
      metrics: [
        { label: "Products", value: "Prototype stage", detail: "Track apparel SKUs and vendor state.", status: "amber" },
        { label: "Campaigns", value: "Concept queue", detail: "Campaigns need dates, channels, and deliverables.", status: "amber" },
        { label: "Marketing Tasks", value: "Manual queue", detail: "Can be automated through marketing agent outputs.", status: "amber" },
        { label: "Brand Metrics", value: "Not connected", detail: "Social and store metrics need integration.", status: "red" }
      ],
      items: [
        { title: "Product catalog", detail: "Store product name, status, mockups, vendor, margin, and launch channel.", status: "amber" },
        { title: "Campaign board", detail: "Use active campaign records to drive daily content tasks.", status: "amber" }
      ]
    },
    {
      id: "legacy-archive",
      name: "Blackburn Legacy Archive",
      callSign: "Permanent Memory",
      mission: "Preserve research, family history, code, media, records, and technical inventions.",
      status: "green",
      metrics: [
        { label: "Archive Size", value: "Needs scan", detail: "Calculate from vault index and storage inventory.", status: "amber" },
        { label: "Total Assets", value: "Inventory pending", detail: "Use archive_assets rows as source of truth.", status: "amber" },
        { label: "Preservation Score", value: "V1 formula ready", detail: "Metadata + backups + checksums + open formats.", status: "green" },
        { label: "Backup Status", value: "Manual", detail: "Monthly offline and cloud verification required.", status: "amber" },
        { label: "Recently Added Knowledge", value: "Fallback feed", detail: "Latest archive_assets will populate this panel.", status: "green" }
      ],
      items: [
        { title: "Asset inventory", detail: "Every critical file gets owner, division, type, sensitivity, checksum, and path.", status: "green" },
        { title: "Annual legacy snapshot", detail: "Export PDFs, JSON, CSV, code archive, media catalog, and family index annually.", status: "amber" }
      ]
    }
  ]
};

function normalizeStatus(value: unknown): CommandStatus {
  if (value === "green" || value === "amber" || value === "red") {
    return value;
  }

  return "amber";
}

export async function loadArchaiosCommandSnapshot(): Promise<ArchaiosCommandSnapshot> {
  if (!isSupabaseEnabled || !supabase) {
    return fallbackSnapshot;
  }

  try {
    const [{ data: executiveRows, error: executiveError }, { data: divisionRows, error: divisionError }] =
      await Promise.all([
        supabase.from("archaios_command_entries").select("*").order("priority", { ascending: true }),
        supabase.from("archaios_division_snapshots").select("*").order("sort_order", { ascending: true })
      ]);

    if (executiveError || divisionError) {
      return fallbackSnapshot;
    }

    const divisions = Array.isArray(divisionRows) && divisionRows.length
      ? divisionRows.map((row: Record<string, any>) => ({
          id: String(row.division_key || row.id),
          name: String(row.name || "Unnamed Division"),
          callSign: String(row.call_sign || "Command"),
          mission: String(row.mission || "No mission recorded."),
          status: normalizeStatus(row.status),
          metrics: Array.isArray(row.metrics) ? row.metrics : [],
          items: Array.isArray(row.items) ? row.items : []
        }))
      : fallbackSnapshot.divisions;

    const commandRows = Array.isArray(executiveRows) ? executiveRows : [];
    const byType = (type: string) => commandRows.filter((row: Record<string, any>) => row.entry_type === type);
    const firstSitrep = byType("sitrep")[0];
    const firstMission = byType("mission_status")[0];

    return {
      generatedAt: new Date().toISOString(),
      source: "supabase",
      executive: {
        missionStatus: String(firstMission?.detail || fallbackSnapshot.executive.missionStatus),
        dailySitrep: String(firstSitrep?.detail || fallbackSnapshot.executive.dailySitrep),
        priorities: byType("priority").map((row: Record<string, any>) => ({
          title: String(row.title),
          detail: String(row.detail || ""),
          status: normalizeStatus(row.status)
        })),
        activeProjects: byType("active_project").map((row: Record<string, any>) => ({
          title: String(row.title),
          detail: String(row.detail || ""),
          status: normalizeStatus(row.status)
        })),
        strategicRisks: byType("strategic_risk").map((row: Record<string, any>) => ({
          title: String(row.title),
          detail: String(row.detail || ""),
          status: normalizeStatus(row.status)
        }))
      },
      divisions
    };
  } catch {
    return fallbackSnapshot;
  }
}
