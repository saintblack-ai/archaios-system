// Sprint 18 operational persistence workspace for local mission lifecycle, resume context, markdown exports, and integrity checks.
import SwiftData
import SwiftUI
#if canImport(UIKit)
import UIKit
#endif

struct OperationalPersistenceLaunchCard: View {
    @EnvironmentObject private var themeManager: ThemeManager
    @Query(sort: \OperationalMissionRecord.updatedAt, order: .reverse) private var missions: [OperationalMissionRecord]
    @Query(sort: \LocalMarkdownExportRecord.createdAt, order: .reverse) private var exports: [LocalMarkdownExportRecord]
    @Query(sort: \ResumeStateRecord.updatedAt, order: .reverse) private var resume: [ResumeStateRecord]

    var body: some View {
        CommandCard(title: "Operational Persistence", systemImage: "externaldrive.badge.checkmark") {
            Text("Persistent command center memory, mission resume, and local Markdown exports.")
                .font(.caption)
                .foregroundStyle(themeManager.theme.text.opacity(0.70))
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 145), spacing: 10)], spacing: 10) {
                MetricCard(title: "Sprint", value: resume.first?.lastSprint ?? "Sprint 18", context: "Resume engine")
                MetricCard(title: "Missions", value: "\(missions.count)", context: missions.first?.state ?? "No records")
                MetricCard(title: "Exports", value: "\(exports.count)", context: exports.first?.kind ?? "Markdown ready")
                MetricCard(title: "Last Screen", value: resume.first?.currentScreen ?? "Operational", context: "Auto restore")
            }
        }
    }
}

struct OperationalPersistenceView: View {
    @EnvironmentObject private var themeManager: ThemeManager
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \OperationalMissionRecord.updatedAt, order: .reverse) private var operationalMissions: [OperationalMissionRecord]
    @Query(sort: \LocalMarkdownExportRecord.createdAt, order: .reverse) private var exports: [LocalMarkdownExportRecord]
    @Query(sort: \DailyOperationalBriefRecord.createdAt, order: .reverse) private var operationalBriefs: [DailyOperationalBriefRecord]
    @Query(sort: \CommanderMemoryRecord.updatedAt, order: .reverse) private var commanderMemory: [CommanderMemoryRecord]
    @Query(sort: \ResumeStateRecord.updatedAt, order: .reverse) private var resumeStates: [ResumeStateRecord]
    @Query(sort: \Mission.createdAt, order: .reverse) private var missions: [Mission]
    @Query(sort: \SavedMission.createdAt, order: .reverse) private var savedMissions: [SavedMission]
    @Query(sort: \FounderJournalEntry.createdAt, order: .reverse) private var founderJournal: [FounderJournalEntry]
    @Query(sort: \JournalEntry.createdAt, order: .reverse) private var journal: [JournalEntry]
    @Query(sort: \ResearchNote.createdAt, order: .reverse) private var research: [ResearchNote]
    @Query(sort: \MusicProjectNote.createdAt, order: .reverse) private var music: [MusicProjectNote]
    @Query(sort: \KnowledgeCollectionRecord.createdAt, order: .reverse) private var collections: [KnowledgeCollectionRecord]
    @Query(sort: \VaultEntry.createdAt, order: .reverse) private var vault: [VaultEntry]
    @Query(sort: \CommandTimelineEvent.createdAt, order: .reverse) private var commandTimeline: [CommandTimelineEvent]
    @Query(sort: \ExecutiveDecisionRecord.createdAt, order: .reverse) private var decisions: [ExecutiveDecisionRecord]
    @State private var missionTitle = "Operation Persistence Gate"
    @State private var missionState = OperationalMissionState.active
    @State private var missionObjective = "Restore mission context and produce local intelligence exports."
    @State private var missionNextAction = "Generate daily brief and export mission report."
    @State private var missionBlockers = "Physical device install pending."
    @State private var missionNotes = "Related to Commander memory, Black Vault, Daily OS, and Sprint 18."
    @State private var selectedExportKind = LocalExportKind.dailyBrief
    @State private var selectedMissionID: UUID?
    @State private var lastExportPreview = ""

    private var memory: CommanderMemoryRecord? { commanderMemory.first }
    private var resume: ResumeStateRecord? { resumeStates.first }

    private var selectedMission: OperationalMissionRecord? {
        if let selectedMissionID,
           let selected = operationalMissions.first(where: { $0.id == selectedMissionID }) {
            return selected
        }
        return lastActiveMission
    }

    private var lastActiveMission: OperationalMissionRecord? {
        operationalMissions.first { item in
            item.state == OperationalMissionState.active.rawValue ||
                item.state == OperationalMissionState.paused.rawValue ||
                item.state == OperationalMissionState.blocked.rawValue
        } ?? operationalMissions.first
    }

    private var activeOperationalMissions: [OperationalMissionRecord] {
        operationalMissions.filter { $0.state == OperationalMissionState.active.rawValue }
    }

    private var pausedOperationalMissions: [OperationalMissionRecord] {
        operationalMissions.filter { $0.state == OperationalMissionState.paused.rawValue }
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                SectionHeader(title: "Operational Persistence", subtitle: "Sprint 18 local mission lifecycle, resume engine, daily brief, Markdown export, timeline, continuation, and integrity checks.")
                resumeContextPanel
                missionLifecyclePanel
                dailyBriefPanel
                commanderContinuationPanel
                localExportPanel
                intelligenceTimelinePanel
                integrityCheckPanel
            }
            .padding()
        }
        .background(themeManager.theme.background)
        .navigationTitle("Persistence")
        .onAppear {
            ensureBaselineRecords()
            updateResumeContext(screen: "Operational Persistence")
        }
    }

    private var resumeContextPanel: some View {
        CommandCard(title: "Resume Last Context", systemImage: "arrow.clockwise.circle.fill") {
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 150), spacing: 10)], spacing: 10) {
                MetricCard(title: "Last Screen", value: resume?.currentScreen ?? "Operational Persistence", context: "Restored on launch")
                MetricCard(title: "Last Mission", value: memory?.lastMission ?? selectedMission?.title ?? "None", context: "Commander memory")
                MetricCard(title: "Last Sprint", value: resume?.lastSprint ?? "Sprint 18", context: "Operational persistence")
                MetricCard(title: "Last Note", value: latestNoteTitle, context: "Journal / Vault / Research")
                MetricCard(title: "Last Command", value: commandTimeline.first?.title ?? "None", context: "Timeline")
                MetricCard(title: "Selected Research", value: resume?.selectedResearch ?? research.first?.title ?? "None", context: "Resume state")
                MetricCard(title: "Black Vault", value: vault.first?.title ?? "None", context: "Last opened placeholder")
            }
        }
    }

    private var missionLifecyclePanel: some View {
        CommandCard(title: "Mission Lifecycle", systemImage: "target") {
            TextField("Mission title", text: $missionTitle).operationalField(themeManager)
            Picker("State", selection: $missionState) {
                ForEach(OperationalMissionState.allCases) { state in
                    Text(state.rawValue).tag(state)
                }
            }
            .pickerStyle(.segmented)
            TextField("Current objective", text: $missionObjective, axis: .vertical).operationalField(themeManager)
            TextField("Next action", text: $missionNextAction, axis: .vertical).operationalField(themeManager)
            TextField("Blockers", text: $missionBlockers, axis: .vertical).operationalField(themeManager)
            TextField("Related notes", text: $missionNotes, axis: .vertical).operationalField(themeManager)
            CommanderButton(title: "Save Mission State", systemImage: "tray.and.arrow.down.fill") {
                saveMissionState()
            }
            ForEach(operationalMissions.prefix(8)) { mission in
                OperationalMissionRow(mission: mission, isSelected: mission.id == selectedMission?.id) {
                    selectedMissionID = mission.id
                    updateResumeContext(screen: "Operational Persistence")
                } onStateChange: { state in
                    updateMission(mission, state: state)
                }
            }
        }
    }

    private var dailyBriefPanel: some View {
        CommandCard(title: "Daily Brief Generator", systemImage: "sunrise.fill") {
            Text(currentDailyBriefMarkdown)
                .font(.caption)
                .foregroundStyle(themeManager.theme.text.opacity(0.76))
                .textSelection(.enabled)
            CommanderButton(title: "Generate Local Daily Brief", systemImage: "doc.text.fill") {
                generateDailyBrief()
            }
            if let latest = operationalBriefs.first {
                TimelineRow(title: latest.title, detail: latest.summary, status: .green)
            }
        }
    }

    private var commanderContinuationPanel: some View {
        CommandCard(title: "Commander Continuation", systemImage: "play.circle.fill") {
            if let mission = selectedMission {
                Text(mission.title)
                    .font(.title3.weight(.black))
                    .foregroundStyle(themeManager.theme.heading)
                TimelineRow(title: "Current Objective", detail: mission.currentObjective, status: .green)
                TimelineRow(title: "Next Action", detail: mission.nextAction, status: .standby)
                TimelineRow(title: "Blockers", detail: mission.blockers.isEmpty ? "No blockers recorded." : mission.blockers, status: mission.blockers.isEmpty ? .green : .amber)
                TimelineRow(title: "Related Notes", detail: mission.relatedNotes, status: .standby)
                TimelineRow(title: "Recent Activity", detail: mission.recentActivity, status: .green)
                CommanderButton(title: "Continue Mission", systemImage: "arrowshape.turn.up.right.fill") {
                    continueMission(mission)
                }
            } else {
                EmptyStateView(title: "No mission selected", detail: "Save a Sprint 18 mission state to activate mission continuation.", systemImage: "target")
            }
        }
    }

    private var localExportPanel: some View {
        CommandCard(title: "Local Backup / Export", systemImage: "square.and.arrow.up.on.square.fill") {
            Picker("Export Type", selection: $selectedExportKind) {
                ForEach(LocalExportKind.allCases) { kind in
                    Text(kind.rawValue).tag(kind)
                }
            }
            .pickerStyle(.menu)
            CommanderButton(title: "Create Markdown Export", systemImage: "doc.plaintext.fill") {
                exportMarkdown(kind: selectedExportKind)
            }
            if !lastExportPreview.isEmpty {
                Text(lastExportPreview)
                    .font(.caption)
                    .foregroundStyle(themeManager.theme.text.opacity(0.76))
                    .textSelection(.enabled)
                    .padding(10)
                    .background(themeManager.theme.elevatedPanel)
                    .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
            }
            ForEach(exports.prefix(5)) { item in
                TimelineRow(title: item.title, detail: "\(item.kind) | \(item.fileName) | \(item.createdAt.formatted(date: .abbreviated, time: .shortened))", status: .green)
            }
        }
    }

    private var intelligenceTimelinePanel: some View {
        CommandCard(title: "Intelligence Timeline", systemImage: "timeline.selection") {
            ForEach(intelligenceTimeline.prefix(18), id: \.self) { item in
                Text(item)
                    .font(.caption)
                    .foregroundStyle(themeManager.theme.text.opacity(0.76))
                    .padding(.vertical, 2)
            }
        }
    }

    private var integrityCheckPanel: some View {
        CommandCard(title: "Integrity Check", systemImage: "checkmark.shield.fill") {
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 150), spacing: 10)], spacing: 10) {
                MetricCard(title: "SwiftData", value: "Online", context: "Model container active")
                MetricCard(title: "Last Backup", value: exports.first?.createdAt.formatted(date: .abbreviated, time: .shortened) ?? "None", context: "Markdown export")
                MetricCard(title: "Mission Count", value: "\(operationalMissions.count + missions.count + savedMissions.count)", context: "\(activeOperationalMissions.count) active")
                MetricCard(title: "Journal Count", value: "\(founderJournal.count + journal.count)", context: "Local")
                MetricCard(title: "Research Count", value: "\(research.count + collections.filter { $0.category == "Research" }.count)", context: "Local")
                MetricCard(title: "Pending Items", value: "\(pendingItemCount)", context: "Missions + blockers")
                MetricCard(title: "Warnings", value: "\(warnings.count)", context: warnings.first ?? "No warnings")
            }
            ForEach(warnings, id: \.self) { warning in
                TimelineRow(title: "Warning", detail: warning, status: .amber)
            }
        }
    }

    private var latestNoteTitle: String {
        founderJournal.first?.title ?? journal.first?.title ?? research.first?.title ?? vault.first?.title ?? "None"
    }

    private var pendingItemCount: Int {
        operationalMissions.filter { item in
            item.state == OperationalMissionState.planned.rawValue ||
                item.state == OperationalMissionState.paused.rawValue ||
                item.state == OperationalMissionState.blocked.rawValue
        }.count
    }

    private var warnings: [String] {
        var output: [String] = []
        if exports.isEmpty { output.append("No local Markdown backup has been generated yet.") }
        if operationalMissions.contains(where: { $0.state == OperationalMissionState.blocked.rawValue }) {
            output.append("At least one mission is blocked.")
        }
        if resumeStates.isEmpty { output.append("Resume state will be created on this launch.") }
        return output.isEmpty ? ["No local integrity warnings."] : output
    }

    private var currentDailyBriefMarkdown: String {
        """
        # ARCHAIOS Daily Brief

        ## Active Missions
        \(bulletList(activeOperationalMissions.map(\.title)))

        ## Paused Missions
        \(bulletList(pausedOperationalMissions.map(\.title)))

        ## Commander Notes
        \(memory?.currentObjective ?? "Continue Sprint 18 operational persistence.")

        ## Recent Research
        \(bulletList(research.prefix(3).map(\.title)))

        ## Recent Music Work
        \(bulletList(music.prefix(3).map { "\($0.project): \($0.title)" }))

        ## Recent Engineering Work
        \(bulletList(collections.filter { $0.category == "Architecture" }.prefix(3).map(\.title)))

        ## System Health
        SwiftData online. \(warnings.joined(separator: " "))
        """
    }

    private var intelligenceTimeline: [String] {
        let missionItems = operationalMissions.map { "\($0.updatedAt.formatted(date: .abbreviated, time: .shortened)) | Mission | \($0.title) | \($0.state)" }
        let sprintItems = commandTimeline.filter { $0.title.localizedCaseInsensitiveContains("Sprint") || $0.detail.localizedCaseInsensitiveContains("Sprint") }.map { "\($0.createdAt.formatted(date: .abbreviated, time: .shortened)) | Sprint | \($0.title)" }
        let journalItems = founderJournal.map { "\($0.createdAt.formatted(date: .abbreviated, time: .shortened)) | Journal | \($0.title)" } + journal.map { "\($0.createdAt.formatted(date: .abbreviated, time: .shortened)) | Journal | \($0.title)" }
        let researchItems = research.map { "\($0.createdAt.formatted(date: .abbreviated, time: .shortened)) | Research | \($0.title)" }
        let musicItems = music.map { "\($0.createdAt.formatted(date: .abbreviated, time: .shortened)) | Music | \($0.project): \($0.title)" }
        let architectureItems = collections.filter { $0.category == "Architecture" }.map { "\($0.createdAt.formatted(date: .abbreviated, time: .shortened)) | Architecture | \($0.title)" }
        let decisionItems = decisions.map { "\($0.createdAt.formatted(date: .abbreviated, time: .shortened)) | Decision | \($0.decision)" }
        return (missionItems + sprintItems + journalItems + researchItems + musicItems + architectureItems + decisionItems).sorted(by: >)
    }

    private func ensureBaselineRecords() {
        if operationalMissions.isEmpty {
            modelContext.insert(OperationalMissionRecord(
                title: "Sprint 18 Operational Persistence",
                state: OperationalMissionState.active.rawValue,
                currentObjective: "Remember work, resume missions, and export intelligence locally.",
                nextAction: "Generate daily brief, export Markdown, and verify build.",
                blockers: "Physical iPhone verification depends on connected unlocked device.",
                relatedNotes: "Commander Memory, Living Intelligence, Black Vault, Daily OS.",
                recentActivity: "Sprint 18 workspace initialized."
            ))
        }
        if resumeStates.isEmpty {
            modelContext.insert(ResumeStateRecord(currentScreen: "Operational Persistence", mission: "Sprint 18 Operational Persistence", lastSprint: "Sprint 18"))
        }
        if commanderMemory.isEmpty {
            modelContext.insert(CommanderMemoryRecord(currentMission: "Sprint 18 Operational Persistence", currentSprint: "Sprint 18", currentObjective: "Persist mission state, resume context, and local exports.", resumePoint: "Operational Persistence"))
        }
    }

    private func saveMissionState() {
        let title = missionTitle.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? "Sprint 18 Mission" : missionTitle
        let record = OperationalMissionRecord(
            title: title,
            state: missionState.rawValue,
            currentObjective: missionObjective,
            nextAction: missionNextAction,
            blockers: missionBlockers,
            relatedNotes: missionNotes,
            recentActivity: "Mission state saved \(Date.now.formatted(date: .abbreviated, time: .shortened))."
        )
        modelContext.insert(record)
        selectedMissionID = record.id
        updateResumeContext(screen: "Operational Persistence")
    }

    private func updateMission(_ mission: OperationalMissionRecord, state: OperationalMissionState) {
        mission.state = state.rawValue
        mission.updatedAt = .now
        if state == .completed { mission.completedAt = .now }
        if state == .archived { mission.archivedAt = .now }
        mission.recentActivity = "State changed to \(state.rawValue) \(Date.now.formatted(date: .abbreviated, time: .shortened))."
    }

    private func continueMission(_ mission: OperationalMissionRecord) {
        selectedMissionID = mission.id
        mission.state = OperationalMissionState.active.rawValue
        mission.updatedAt = .now
        mission.recentActivity = "Continued from Commander \(Date.now.formatted(date: .abbreviated, time: .shortened))."
        updateResumeContext(screen: "Operational Persistence")
        #if canImport(UIKit)
        UIPasteboard.general.string = missionContinuationMarkdown(mission)
        #endif
    }

    private func generateDailyBrief() {
        let brief = DailyOperationalBriefRecord(
            title: "ARCHAIOS Daily Brief",
            summary: "Active \(activeOperationalMissions.count), paused \(pausedOperationalMissions.count), pending \(pendingItemCount), warnings \(warnings.count).",
            activeMissions: activeOperationalMissions.map(\.title).joined(separator: "\n"),
            pausedMissions: pausedOperationalMissions.map(\.title).joined(separator: "\n"),
            commanderNotes: memory?.currentObjective ?? "Continue Sprint 18.",
            recentResearch: research.prefix(5).map(\.title).joined(separator: "\n"),
            recentMusicWork: music.prefix(5).map { "\($0.project): \($0.title)" }.joined(separator: "\n"),
            recentEngineeringWork: collections.filter { $0.category == "Architecture" }.prefix(5).map(\.title).joined(separator: "\n"),
            systemHealth: "SwiftData online. \(warnings.joined(separator: " "))"
        )
        modelContext.insert(brief)
        exportMarkdown(kind: .dailyBrief)
    }

    private func exportMarkdown(kind: LocalExportKind) {
        let markdown: String
        switch kind {
        case .missionReport:
            markdown = missionReportMarkdown(selectedMission)
        case .dailyBrief:
            markdown = currentDailyBriefMarkdown
        case .journalEntry:
            markdown = journalMarkdown()
        case .sprintReport:
            markdown = sprintReportMarkdown()
        case .blackVaultNote:
            markdown = blackVaultMarkdown()
        }
        let title = "\(kind.rawValue) Export"
        let fileName = "\(kind.rawValue.replacingOccurrences(of: " ", with: "_"))_\(Date.now.formatted(.iso8601.year().month().day())).md"
        modelContext.insert(LocalMarkdownExportRecord(title: title, kind: kind.rawValue, markdown: markdown, fileName: fileName))
        lastExportPreview = markdown
        #if canImport(UIKit)
        UIPasteboard.general.string = markdown
        #endif
    }

    private func updateResumeContext(screen: String) {
        let record = resume ?? ResumeStateRecord()
        record.currentScreen = screen
        record.mission = selectedMission?.title ?? lastActiveMission?.title ?? "Sprint 18 Operational Persistence"
        record.selectedResearch = research.first?.title ?? record.selectedResearch
        record.draftPrompt = "Continue Sprint 18 operational persistence."
        record.openJournal = founderJournal.first?.title ?? journal.first?.title ?? record.openJournal
        record.lastSprint = "Sprint 18"
        record.updatedAt = .now
        if resume == nil { modelContext.insert(record) }

        let memoryRecord = memory ?? CommanderMemoryRecord()
        memoryRecord.currentMission = record.mission
        memoryRecord.currentSprint = "Sprint 18"
        memoryRecord.lastMission = record.mission
        memoryRecord.lastJournal = record.openJournal
        memoryRecord.lastResearch = record.selectedResearch
        memoryRecord.currentObjective = selectedMission?.currentObjective ?? memoryRecord.currentObjective
        memoryRecord.resumePoint = screen
        memoryRecord.updatedAt = .now
        if memory == nil { modelContext.insert(memoryRecord) }
    }

    private func missionReportMarkdown(_ mission: OperationalMissionRecord?) -> String {
        let item = mission ?? lastActiveMission
        return """
        # Mission Report

        ## Mission
        \(item?.title ?? "No mission selected")

        ## State
        \(item?.state ?? "Unknown")

        ## Current Objective
        \(item?.currentObjective ?? "No objective recorded.")

        ## Next Action
        \(item?.nextAction ?? "No next action recorded.")

        ## Blockers
        \(item?.blockers ?? "No blockers recorded.")

        ## Related Notes
        \(item?.relatedNotes ?? "No related notes recorded.")
        """
    }

    private func missionContinuationMarkdown(_ mission: OperationalMissionRecord) -> String {
        """
        # Continue Mission: \(mission.title)

        - Current objective: \(mission.currentObjective)
        - Next action: \(mission.nextAction)
        - Blockers: \(mission.blockers.isEmpty ? "None" : mission.blockers)
        - Related notes: \(mission.relatedNotes)
        - Recent activity: \(mission.recentActivity)
        """
    }

    private func journalMarkdown() -> String {
        let entry = founderJournal.first
        return """
        # Journal Entry

        ## \(entry?.title ?? journal.first?.title ?? "No journal entry")
        \(entry?.body ?? journal.first?.body ?? "No journal text recorded.")
        """
    }

    private func sprintReportMarkdown() -> String {
        """
        # Sprint 18 Operational Persistence

        ## Completed Locally
        - Mission lifecycle states
        - Resume context restoration
        - Daily brief generator
        - Markdown export records
        - Intelligence timeline
        - Commander continuation
        - Integrity check panel
        """
    }

    private func blackVaultMarkdown() -> String {
        let entry = vault.first
        return """
        # Black Vault Note

        ## \(entry?.title ?? "No vault entry")
        Category: \(entry?.category ?? "None")

        \(entry?.tagLine ?? "No Black Vault note recorded.")
        """
    }

    private func bulletList(_ items: [String]) -> String {
        guard !items.isEmpty else { return "- None recorded." }
        return items.map { "- \($0)" }.joined(separator: "\n")
    }
}

private struct OperationalMissionRow: View {
    @EnvironmentObject private var themeManager: ThemeManager
    let mission: OperationalMissionRecord
    let isSelected: Bool
    let onSelect: () -> Void
    let onStateChange: (OperationalMissionState) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                VStack(alignment: .leading, spacing: 3) {
                    Text(mission.title)
                        .font(.subheadline.weight(.black))
                        .foregroundStyle(themeManager.theme.text)
                    Text("\(mission.sprint) | \(mission.priority) | \(mission.updatedAt.formatted(date: .abbreviated, time: .shortened))")
                        .font(.caption2)
                        .foregroundStyle(themeManager.theme.text.opacity(0.56))
                }
                Spacer()
                Text(mission.state)
                    .font(.caption2.weight(.black))
                    .foregroundStyle(isSelected ? .black : themeManager.theme.heading)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 5)
                    .background(isSelected ? themeManager.theme.heading : themeManager.theme.elevatedPanel)
                    .clipShape(Capsule())
            }
            Text(mission.currentObjective)
                .font(.caption)
                .foregroundStyle(themeManager.theme.text.opacity(0.68))
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 6) {
                    Button("Select", action: onSelect)
                    ForEach(OperationalMissionState.allCases) { state in
                        Button(state.rawValue) { onStateChange(state) }
                    }
                }
                .buttonStyle(.bordered)
                .tint(themeManager.theme.heading)
            }
        }
        .padding(.vertical, 8)
    }
}

private extension View {
    func operationalField(_ themeManager: ThemeManager) -> some View {
        self
            .textFieldStyle(.plain)
            .padding(10)
            .foregroundStyle(themeManager.theme.text)
            .background(themeManager.theme.elevatedPanel)
            .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
    }
}
