/**
 * Tiny fetch wrapper with typed JSON, query-string building and clear errors.
 * Open-Meteo is keyless for non-commercial use, so everything runs client-side.
 * If you switch to a keyed provider, move these calls behind a serverless
 * function and read the key from a server-only env var (see README).
 */

export class ApiError extends Error {
  readonly status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type QueryValue = string | number | boolean | Array<string | number>

export function buildUrl(
  base: string,
  params: Record<string, QueryValue | undefined>,
): string {
  const url = new URL(base)
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue
    url.searchParams.set(key, Array.isArray(value) ? value.join(',') : String(value))
  }
  return url.toString()
}

export async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  let res: Response
  try {
    res = await fetch(url, { signal })
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === 'AbortError') throw cause
    throw new ApiError('Network request failed — check your connection.')
  }

  if (!res.ok) {
    // Open-Meteo returns { error: true, reason: "..." } on bad requests.
    let reason = `Request failed (${res.status})`
    try {
      const body = (await res.json()) as { reason?: string }
      if (body?.reason) reason = body.reason
    } catch {
      /* non-JSON error body — keep the status message */
    }
    throw new ApiError(reason, res.status)
  }

  return (await res.json()) as T
}
