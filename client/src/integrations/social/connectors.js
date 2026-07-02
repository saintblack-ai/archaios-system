const SUPPORTED_PLATFORMS = ["X", "Facebook", "Instagram"];

function createDryRunResult(platform, content) {
  return {
    ok: true,
    mode: "dry-run",
    platform,
    externalId: `dry-run-${platform.toLowerCase()}-${Date.now()}`,
    message: `Dry run completed for ${platform}. No external API call was made.`,
    contentPreview: String(content?.copy || content?.text || content || "").slice(0, 180)
  };
}

function assertSupportedPlatform(platform) {
  if (!SUPPORTED_PLATFORMS.includes(platform)) {
    throw new Error(`${platform} is not connected. Supported platforms: ${SUPPORTED_PLATFORMS.join(", ")}.`);
  }
}

export function getSocialConnectorStatus(config = {}) {
  return SUPPORTED_PLATFORMS.map((platform) => ({
    platform,
    connected: Boolean(config.credentials?.[platform]?.enabled),
    mode: config.credentials?.[platform]?.enabled ? "api-ready" : "dry-run",
    requiredCredentials:
      platform === "X"
        ? ["X_API_KEY", "X_API_SECRET", "X_ACCESS_TOKEN"]
        : ["META_APP_ID", "META_APP_SECRET", "META_PAGE_ACCESS_TOKEN"]
  }));
}

export async function postToX(content, config = {}) {
  if (!config.credentials?.X?.enabled) {
    return createDryRunResult("X", content);
  }

  throw new Error("X API v2 connector is prepared but not activated. Add server-side credentials before enabling real posting.");
}

export async function postToFacebook(content, config = {}) {
  if (!config.credentials?.Facebook?.enabled) {
    return createDryRunResult("Facebook", content);
  }

  throw new Error("Facebook Graph API connector is prepared but not activated. Add server-side credentials before enabling real posting.");
}

export async function postToInstagram(content, config = {}) {
  if (!config.credentials?.Instagram?.enabled) {
    return createDryRunResult("Instagram", content);
  }

  throw new Error("Instagram Graph API connector is prepared but not activated. Add server-side credentials before enabling real posting.");
}

export async function postContent(platform, content, config = {}) {
  assertSupportedPlatform(platform);

  if (platform === "X") {
    return postToX(content, config);
  }

  if (platform === "Facebook") {
    return postToFacebook(content, config);
  }

  return postToInstagram(content, config);
}

export { SUPPORTED_PLATFORMS };
