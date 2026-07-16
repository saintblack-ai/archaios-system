export async function fetchJsonWithTimeout(url, options = {}) {
  const {
    timeoutMs = 8000,
    retries = 1,
    fetchImpl = fetch,
    headers = {},
    ...fetchOptions
  } = options;

  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetchImpl(url, {
        ...fetchOptions,
        headers: {
          "User-Agent": "ARCHAIOS-Intelligence-OS/1.0",
          Accept: "application/json",
          ...headers
        },
        signal: controller.signal
      });
      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`http_${response.status}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timer);
      lastError = error;
      if (attempt === retries) {
        break;
      }
    }
  }

  throw lastError || new Error("fetch_failed");
}
