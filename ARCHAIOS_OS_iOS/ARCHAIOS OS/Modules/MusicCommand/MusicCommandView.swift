import SwiftData
import SwiftUI

struct MusicCommandView: View {
    @EnvironmentObject private var themeManager: ThemeManager
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \MusicProjectNote.createdAt, order: .reverse) private var notes: [MusicProjectNote]
    @StateObject var viewModel: MusicCommandViewModel
    @State private var project = "Spymaster"
    @State private var category = "Song Idea"
    @State private var title = ""
    @State private var note = ""
    @State private var tags = ""
    @State private var searchText = ""

    private var filteredNotes: [MusicProjectNote] {
        notes.filter { item in
            searchText.isEmpty ||
                item.title.localizedCaseInsensitiveContains(searchText) ||
                item.note.localizedCaseInsensitiveContains(searchText) ||
                item.project.localizedCaseInsensitiveContains(searchText) ||
                item.tagsText.localizedCaseInsensitiveContains(searchText)
        }
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                SectionHeader(title: "Music Command", subtitle: "Spymaster, Jugg 'Em, ideas, lyrics, releases, visuals, and studio execution.")

                projectTrackers
                albumPlans
                releaseCalendar
                studioTasks
                streamingChecklist
                noteComposer
                noteArchive
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 18)
        }
        .background(themeManager.theme.background)
        .navigationTitle("Music")
    }

    private var projectTrackers: some View {
        VStack(spacing: 12) {
            ForEach(viewModel.trackers) { tracker in
                CommandCard(title: tracker.title, systemImage: "music.mic") {
                    Text(tracker.phase)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(themeManager.theme.text.opacity(0.78))
                    ProgressView(value: tracker.progress)
                        .tint(themeManager.theme.heading)
                    Text(tracker.nextAction)
                        .font(.subheadline)
                        .foregroundStyle(themeManager.theme.text.opacity(0.70))
                    Label(tracker.releaseWindow, systemImage: "calendar")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(themeManager.theme.heading.opacity(0.86))
                }
            }
        }
    }

    private var albumPlans: some View {
        CommandCard(title: "Albums + Track Ideas", systemImage: "record.circle") {
            ForEach(viewModel.albums) { album in
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Text(album.title)
                            .font(.headline)
                            .foregroundStyle(themeManager.theme.text)
                        Spacer()
                        StatusPill(title: album.status, status: .standby)
                    }
                    Text(album.focus)
                        .font(.subheadline)
                        .foregroundStyle(themeManager.theme.text.opacity(0.70))
                    LazyVGrid(columns: [GridItem(.adaptive(minimum: 128), spacing: 8)], spacing: 8) {
                        ForEach(album.trackIdeas, id: \.self) { idea in
                            Text(idea)
                                .font(.caption.weight(.bold))
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 8)
                                .foregroundStyle(themeManager.theme.heading)
                                .background(themeManager.theme.elevatedPanel)
                                .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                        }
                    }
                }
                .padding(.vertical, 6)
            }
        }
    }

    private var releaseCalendar: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionHeader(title: "Release Calendar", subtitle: "Local campaign planning. No distribution service connected.")
            ForEach(viewModel.releaseCalendar) { mission in
                ScheduledMissionView(mission: mission)
            }
        }
    }

    private var studioTasks: some View {
        CommandCard(title: "Studio Sessions", systemImage: "waveform") {
            ForEach(viewModel.studioTasks) { task in
                HStack {
                    Image(systemName: task.isComplete ? "checkmark.circle.fill" : "circle")
                        .foregroundStyle(task.isComplete ? themeManager.theme.success : themeManager.theme.text.opacity(0.42))
                    Text(task.title)
                        .font(.subheadline)
                        .foregroundStyle(themeManager.theme.text)
                    Spacer()
                    Text(task.priority)
                        .font(.caption.weight(.bold))
                        .foregroundStyle(themeManager.theme.heading)
                }
            }
        }
    }

    private var streamingChecklist: some View {
        CommandCard(title: "Streaming Checklist", systemImage: "dot.radiowaves.left.and.right") {
            ForEach(viewModel.streamingChecklist) { item in
                Label(item.title, systemImage: "square.dashed")
                    .font(.subheadline)
                    .foregroundStyle(themeManager.theme.text.opacity(0.78))
            }
        }
    }

    private var noteComposer: some View {
        CommandCard(title: "Capture Music Intelligence", systemImage: "square.and.pencil") {
            Picker("Project", selection: $project) {
                Text("Spymaster").tag("Spymaster")
                Text("Jugg 'Em").tag("Jugg 'Em")
                Text("Saint Black").tag("Saint Black")
            }
            .pickerStyle(.segmented)

            Picker("Category", selection: $category) {
                ForEach(viewModel.noteCategories(), id: \.self) { category in
                    Text(category).tag(category)
                }
            }

            TextField("Title", text: $title)
                .textFieldStyle(.plain)
                .padding(10)
                .foregroundStyle(themeManager.theme.text)
                .background(themeManager.theme.elevatedPanel)
                .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))

            TextField("Lyrics, song idea, visual concept, or studio note", text: $note, axis: .vertical)
                .lineLimit(3...7)
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

            CommanderButton(title: "Save Music Note", systemImage: "tray.and.arrow.down.fill") {
                saveNote()
            }
        }
    }

    private var noteArchive: some View {
        CommandCard(title: "Music Archive", systemImage: "folder.fill") {
            TextField("Search music notes", text: $searchText)
                .textFieldStyle(.plain)
                .padding(10)
                .foregroundStyle(themeManager.theme.text)
                .background(themeManager.theme.elevatedPanel)
                .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))

            if filteredNotes.isEmpty {
                EmptyStateView(title: "No music notes yet", detail: "Capture song ideas, lyric fragments, visual concepts, release notes, and studio tasks.", systemImage: "music.note.list")
            } else {
                ForEach(filteredNotes) { item in
                    VStack(alignment: .leading, spacing: 6) {
                        HStack {
                            Text(item.title)
                                .font(.headline)
                                .foregroundStyle(themeManager.theme.text)
                            Spacer()
                            StatusPill(title: item.project, status: .standby)
                        }
                        Text(item.note)
                            .font(.subheadline)
                            .foregroundStyle(themeManager.theme.text.opacity(0.70))
                        Text([item.category, item.tagsText].filter { !$0.isEmpty }.joined(separator: " | "))
                            .font(.caption)
                            .foregroundStyle(themeManager.theme.heading.opacity(0.84))
                    }
                    .padding(.vertical, 8)
                }
            }
        }
    }

    private func saveNote() {
        let cleanTitle = title.trimmingCharacters(in: .whitespacesAndNewlines)
        let cleanNote = note.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !cleanTitle.isEmpty || !cleanNote.isEmpty else { return }
        modelContext.insert(MusicProjectNote(
            project: project,
            title: cleanTitle.isEmpty ? category : cleanTitle,
            note: cleanNote.isEmpty ? "Captured from Music Command." : cleanNote,
            category: category,
            tagsText: tags.trimmingCharacters(in: .whitespacesAndNewlines)
        ))
        title = ""
        note = ""
        tags = ""
        Haptics.success()
    }
}
