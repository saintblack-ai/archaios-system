import SwiftData
import SwiftUI

struct FounderModeView: View {
    @EnvironmentObject private var themeManager: ThemeManager
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \FounderJournalEntry.createdAt, order: .reverse) private var journalEntries: [FounderJournalEntry]
    @StateObject var viewModel: FounderModeViewModel
    @State private var title = ""
    @State private var bodyText = ""
    @State private var category = "Mission Log"
    @State private var mood = "Focused"
    @State private var energy = "Steady"
    @State private var tags = ""
    @State private var searchText = ""
    @State private var showFavoritesOnly = false

    private let categories = ["Mission Log", "Idea Vault", "Dream Journal", "Research Archive", "Bookmarks"]
    private let moods = ["Focused", "Calm", "Charged", "Reflective", "Creative"]
    private let energyLevels = ["Low", "Steady", "High", "Surge"]

    private var filteredEntries: [FounderJournalEntry] {
        journalEntries.filter { entry in
            let matchesSearch = searchText.isEmpty ||
                entry.title.localizedCaseInsensitiveContains(searchText) ||
                entry.body.localizedCaseInsensitiveContains(searchText) ||
                entry.category.localizedCaseInsensitiveContains(searchText) ||
                entry.tagsText.localizedCaseInsensitiveContains(searchText)
            let matchesFavorite = !showFavoritesOnly || entry.isFavorite
            return matchesSearch && matchesFavorite
        }
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                SectionHeader(title: "Founder Mode", subtitle: "Saint Black journal, music command, growth, business, and dream archive.")
                LazyVGrid(columns: [GridItem(.adaptive(minimum: 160), spacing: 12)], spacing: 12) {
                    ForEach(viewModel.metrics) { metric in
                        MetricCard(title: metric.title, value: metric.value, context: metric.context)
                    }
                }

                journalComposer
                mediaPlaceholders
                journalControls
                journalList
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 18)
        }
        .background(themeManager.theme.background)
        .navigationTitle("Founder Mode")
        .task { await viewModel.load() }
    }

    private var journalComposer: some View {
        CommandCard(title: "Founder Intelligence Journal", systemImage: "book.closed.fill") {
            Picker("Category", selection: $category) {
                ForEach(categories, id: \.self) { category in
                    Text(category).tag(category)
                }
            }

            HStack {
                Picker("Mood", selection: $mood) {
                    ForEach(moods, id: \.self) { mood in
                        Text(mood).tag(mood)
                    }
                }
                Picker("Energy", selection: $energy) {
                    ForEach(energyLevels, id: \.self) { energy in
                        Text(energy).tag(energy)
                    }
                }
            }

            TextField("Entry title", text: $title)
                .textFieldStyle(.plain)
                .padding(10)
                .foregroundStyle(themeManager.theme.text)
                .background(themeManager.theme.elevatedPanel)
                .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))

            TextField("Capture mission note, idea, dream, research, or bookmark", text: $bodyText, axis: .vertical)
                .lineLimit(3...6)
                .textFieldStyle(.plain)
                .padding(10)
                .foregroundStyle(themeManager.theme.text)
                .background(themeManager.theme.elevatedPanel)
                .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))

            TextField("Tags separated by commas", text: $tags)
                .textFieldStyle(.plain)
                .padding(10)
                .foregroundStyle(themeManager.theme.text)
                .background(themeManager.theme.elevatedPanel)
                .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))

            CommanderButton(title: "Save Founder Entry", systemImage: "square.and.arrow.down.fill") {
                saveEntry()
            }
        }
    }

    private var mediaPlaceholders: some View {
        LazyVGrid(columns: [GridItem(.adaptive(minimum: 160), spacing: 12)], spacing: 12) {
            CommandCard(title: "Voice Memo", systemImage: "mic.badge.plus") {
                Text("Placeholder ready for local audio capture in a future sprint.")
                    .font(.caption)
                    .foregroundStyle(themeManager.theme.text.opacity(0.66))
            }
            CommandCard(title: "Photos", systemImage: "photo.stack") {
                Text("Placeholder ready for local photo attachments and visual field notes.")
                    .font(.caption)
                    .foregroundStyle(themeManager.theme.text.opacity(0.66))
            }
        }
    }

    private var journalControls: some View {
        CommandCard(title: "Journal Search", systemImage: "magnifyingglass") {
            TextField("Search entries, tags, categories", text: $searchText)
                .textFieldStyle(.plain)
                .padding(10)
                .foregroundStyle(themeManager.theme.text)
                .background(themeManager.theme.elevatedPanel)
                .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))

            Toggle(isOn: $showFavoritesOnly) {
                Label("Favorites only", systemImage: "star.fill")
                    .foregroundStyle(themeManager.theme.text)
            }
            .tint(themeManager.theme.heading)
        }
    }

    private var journalList: some View {
        CommandCard(title: "Timeline", systemImage: "timeline.selection") {
            if filteredEntries.isEmpty {
                EmptyStateView(title: "No journal entries found", detail: "Capture a daily entry, idea, dream, research note, or bookmark to build the local Founder Vault.", systemImage: "book.closed")
            } else {
                ForEach(filteredEntries) { entry in
                    journalEntryRow(entry)
                }
            }
        }
    }

    private func journalEntryRow(_ entry: FounderJournalEntry) -> some View {
        HStack(alignment: .top, spacing: 12) {
            VStack(spacing: 4) {
                Circle()
                    .fill(entry.isFavorite ? themeManager.theme.heading : themeManager.theme.accent)
                    .frame(width: 10, height: 10)
                Rectangle()
                    .fill(themeManager.theme.text.opacity(0.14))
                    .frame(width: 2, height: 56)
            }

            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text(entry.title)
                        .font(.headline)
                        .foregroundStyle(themeManager.theme.text)
                    Spacer()
                    Button {
                        entry.isFavorite.toggle()
                        Haptics.selection()
                    } label: {
                        Image(systemName: entry.isFavorite ? "star.fill" : "star")
                            .foregroundStyle(themeManager.theme.heading)
                    }
                    .buttonStyle(.plain)
                }

                Text(entry.body)
                    .font(.subheadline)
                    .foregroundStyle(themeManager.theme.text.opacity(0.72))

                HStack {
                    StatusPill(title: entry.category, status: .standby)
                    Text(entry.mood)
                    Text(entry.energy)
                    if !entry.tagsText.isEmpty {
                        Text(entry.tagsText)
                    }
                }
                .font(.caption)
                .foregroundStyle(themeManager.theme.text.opacity(0.58))

                Text(entry.createdAt, style: .date)
                    .font(.caption2)
                    .foregroundStyle(themeManager.theme.text.opacity(0.48))
            }
        }
        .padding(.vertical, 8)
    }

    private func saveEntry() {
        let cleanTitle = title.trimmingCharacters(in: .whitespacesAndNewlines)
        let cleanBody = bodyText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !cleanTitle.isEmpty || !cleanBody.isEmpty else { return }
        let entry = FounderJournalEntry(
            title: cleanTitle.isEmpty ? category : cleanTitle,
            body: cleanBody.isEmpty ? "Captured from Founder Mode." : cleanBody,
            category: category,
            mood: mood,
            energy: energy,
            tagsText: tags.trimmingCharacters(in: .whitespacesAndNewlines)
        )
        modelContext.insert(entry)
        title = ""
        bodyText = ""
        tags = ""
        Haptics.success()
    }
}
