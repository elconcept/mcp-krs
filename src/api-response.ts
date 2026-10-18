/**
 * Interpret API responses without mistaking an HTML challenge/error page
 * for either a valid KRS extract or a missing company. Never log raw HTML,
 * body text, redirect query strings or credentials.
 */
export async function parseApiResponse<T>(res: Response): Promise<T | null> {
    const contentType = res.headers.get("content-type") ?? "missing";
    const finalHost = (() => {
        try { return new URL(res.url).hostname; } catch { return "unknown"; }
    })();
    const safeInfo = `HTTP ${res.status}; content-type=${contentType.slice(0, 100)}; host=${finalHost}`;
    const mediaType = contentType.split(";")[0].trim().toLowerCase();
    const json = mediaType === "application/json" || mediaType.endsWith("+json");
    // A 404 produced by a non-JSON reverse proxy is not a verified KRS miss.
    if (res.status === 404 && json) return null;
    if (!res.ok) throw new Error(`MS KRS API failure (${safeInfo})`);
    if (!json) throw new Error(`MS KRS API returned non-JSON response (${safeInfo})`);
    try {
        const value: unknown = await res.json();
        if (!value || typeof value !== "object" || Array.isArray(value)) {
            throw new Error("Expected JSON object");
        }
        return value as T;
    } catch {
        throw new Error(`MS KRS API invalid JSON response (${safeInfo})`);
    }
}

