import SwiftUI

struct BlackVaultView: View {
    @EnvironmentObject private var themeManager: ThemeManager
    @StateObject var viewModel: BlackVaultViewModel
    @State private var searchText = ""
    @State private var selectedCategory = "All"
    @State private var favoriteIDs: Set<UUID> = []
    @State private var recentIDs: [UUID] = []

    private var categories: [String] {
        ["All", "Pinned", "Favorites", "Recent"] + Array(Set(viewModel.items.map(\.category))).sorted()
    }

    private var filteredItems: [VaultItem] {
        viewModel.items.filter { item in
            let matchesSearch = searchText.isEmpty ||
                item.title.localizedCaseInsensitiveContains(searchText) ||
                item.summary.localizedCaseInsensitiveContains(searchText) ||
                item.body.localizedCaseInsensitiveContains(searchText) ||
                item.tags.joined(separator: " ").localizedCaseInsensitiveContains(searchText)

            let matchesCategory: Bool
            switch selectedCategory {
            case "All":
                matchesCategory = true
            case "Favorites":
                matchesCategory = favoriteIDs.contains(item.id)
            case "Pinned":
                matchesCategory = item.importance >= 10
            case "Recent":
                matchesCategory = recentIDs.contains(item.id)
            default:
                matchesCategory = item.category == selectedCategory
            }

            return matchesSearch && matchesCategory
        }
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 14) {
                SectionHeader(title: "Black Vault Browser", subtitle: "Permanent knowledge repository for founder, product, security, and recovery doctrine.")

                TextField("Search Black Vault", text: $searchText)
                    .textFieldStyle(.plain)
                    .padding()
                    .foregroundStyle(themeManager.theme.text)
                    .background(themeManager.theme.panel)
                    .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))

                ScrollView(.horizontal, showsIndicators: false) {
                    HStack {
                        ForEach(categories, id: \.self) { category in
                            Button(category) { selectedCategory = category }
                                .font(.caption.weight(.bold))
                                .padding(.horizontal, 12)
                                .padding(.vertical, 8)
                                .foregroundStyle(selectedCategory == category ? .black : themeManager.theme.heading)
                                .background(selectedCategory == category ? themeManager.theme.heading : themeManager.theme.panel)
                                .clipShape(Capsule())
                        }
                    }
                }

                if selectedCategory == "All" {
                    pinnedDocuments
                }

                ForEach(filteredItems) { item in
                    NavigationLink {
                        VaultDocumentDetailView(item: item, isFavorite: favoriteIDs.contains(item.id)) {
                            if favoriteIDs.contains(item.id) {
                                favoriteIDs.remove(item.id)
                            } else {
                                favoriteIDs.insert(item.id)
                            }
                        }
                        .onAppear { markRecent(item) }
                    } label: {
                        VaultDocumentRow(item: item)
                    }
                    .buttonStyle(.plain)
                }

                if filteredItems.isEmpty {
                    EmptyStateView(title: "No vault documents found", detail: "Try a different tag, category, favorite state, or search phrase.", systemImage: "archivebox")
                }
            }
            .padding()
        }
        .background(themeManager.theme.background)
        .navigationTitle("Black Vault")
        .task { await viewModel.load() }
    }

    private func markRecent(_ item: VaultItem) {
        recentIDs.removeAll { $0 == item.id }
        recentIDs.insert(item.id, at: 0)
        recentIDs = Array(recentIDs.prefix(6))
    }

    private var pinnedDocuments: some View {
        CommandCard(title: "Pinned Docs", systemImage: "pin.fill") {
            ForEach(viewModel.items.filter { $0.importance >= 10 }.prefix(3)) { item in
                Label(item.title, systemImage: "doc.text.fill")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(themeManager.theme.text.opacity(0.78))
            }
        }
    }
}

private struct VaultDocumentDetailView: View {
    @EnvironmentObject private var themeManager: ThemeManager
    let item: VaultItem
    let isFavorite: Bool
    let toggleFavorite: () -> Void

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                HStack {
                    StatusPill(title: item.category, status: .standby)
                    Spacer()
                    Button(action: toggleFavorite) {
                        Image(systemName: isFavorite ? "star.fill" : "star")
                            .foregroundStyle(themeManager.theme.heading)
                    }
                }
                Text(item.title)
                    .font(.largeTitle.weight(.black))
                    .foregroundStyle(themeManager.theme.heading)
                Text(item.summary)
                    .font(.headline)
                    .foregroundStyle(themeManager.theme.text.opacity(0.72))
                HStack {
                    ForEach(item.tags, id: \.self) { tag in
                        Text("#\(tag)")
                            .font(.caption.weight(.bold))
                            .padding(.horizontal, 9)
                            .padding(.vertical, 5)
                            .foregroundStyle(themeManager.theme.heading)
                            .background(themeManager.theme.panel)
                            .clipShape(Capsule())
                    }
                }
                CommandCard(title: "Document Metadata", systemImage: "info.circle") {
                    MetadataLine(label: "Category", value: item.category)
                    MetadataLine(label: "Importance", value: "\(item.importance)/10")
                    MetadataLine(label: "Updated", value: item.updatedAt.formatted(date: .abbreviated, time: .shortened))
                    ProgressView(value: min(Double(item.importance) / 10.0, 1.0))
                        .tint(themeManager.theme.heading)
                    Text("Reading progress placeholder")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(themeManager.theme.text.opacity(0.58))
                }
                Text(item.body)
                    .font(.body)
                    .lineSpacing(5)
                    .foregroundStyle(themeManager.theme.text)
            }
            .padding()
        }
        .background(themeManager.theme.background)
        .navigationTitle("Document")
    }
}

private struct MetadataLine: View {
    @EnvironmentObject private var themeManager: ThemeManager
    let label: String
    let value: String

    var body: some View {
        HStack {
            Text(label)
                .foregroundStyle(themeManager.theme.text.opacity(0.58))
            Spacer()
            Text(value)
                .foregroundStyle(themeManager.theme.heading)
        }
        .font(.caption.weight(.semibold))
    }
}
