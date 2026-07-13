import Foundation

struct LocalProviderResponse {
    let provider: String
    let summary: String
    let suggestedAction: String
    let createdAt: Date
}

protocol LocalCommandProvider {
    var providerName: String { get }
    var futureCapabilities: [String] { get }
    func mockResponse(for command: String) -> LocalProviderResponse
}

protocol OpenAIProvider: LocalCommandProvider {}
protocol CodexProvider: LocalCommandProvider {}
protocol OpenClawProvider: LocalCommandProvider {}
protocol GitHubProvider: LocalCommandProvider {}
protocol NotionProvider: LocalCommandProvider {}
protocol SupabaseProvider: LocalCommandProvider {}
protocol CloudflareProvider: LocalCommandProvider {}
protocol LocalLLMProvider: LocalCommandProvider {}

struct MockOpenAIProvider: OpenAIProvider {
    let providerName = "OpenAI"
    let futureCapabilities = ["conversation", "reasoning", "brief generation"]
}

struct MockCodexProvider: CodexProvider {
    let providerName = "Codex"
    let futureCapabilities = ["code edits", "build repair", "review"]
}

struct MockOpenClawProvider: OpenClawProvider {
    let providerName = "OpenClaw"
    let futureCapabilities = ["audit", "security review", "local scan"]
}

struct MockGitHubProvider: GitHubProvider {
    let providerName = "GitHub"
    let futureCapabilities = ["issues", "pull requests", "checkpoints"]
}

struct MockNotionProvider: NotionProvider {
    let providerName = "Notion"
    let futureCapabilities = ["knowledge capture", "docs", "vault sync"]
}

struct MockSupabaseProvider: SupabaseProvider {
    let providerName = "Supabase"
    let futureCapabilities = ["schema review", "local status", "data readiness"]
}

struct MockCloudflareProvider: CloudflareProvider {
    let providerName = "Cloudflare"
    let futureCapabilities = ["edge plan", "worker readiness", "tunnel placeholder"]
}

struct MockLocalLLMProvider: LocalLLMProvider {
    let providerName = "Local LLM"
    let futureCapabilities = ["offline response", "private memory", "on-device inference"]
}

extension LocalCommandProvider {
    func mockResponse(for command: String) -> LocalProviderResponse {
        LocalProviderResponse(
            provider: providerName,
            summary: "\(providerName) mock adapter received '\(command)'. No network call was made.",
            suggestedAction: "Store the command locally, attach it to a mission, and review before any future bridge execution.",
            createdAt: .now
        )
    }
}

enum FutureCommandBridge {
    static let providers: [any LocalCommandProvider] = [
        MockOpenAIProvider(),
        MockCodexProvider(),
        MockOpenClawProvider(),
        MockGitHubProvider(),
        MockNotionProvider(),
        MockSupabaseProvider(),
        MockCloudflareProvider(),
        MockLocalLLMProvider()
    ]
}
