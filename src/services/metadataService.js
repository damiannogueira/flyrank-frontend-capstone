const MICROLINK_ENDPOINT = 'https://api.microlink.io/'
const DEFAULT_TIMEOUT_MS = 8000

export class MetadataServiceError extends Error {
  constructor(code, options) {
    super(code, options)
    this.name = 'MetadataServiceError'
    this.code = code
  }
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function normalizeText(value) {
  if (typeof value !== 'string') return null

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function normalizeAssetUrl(value) {
  const normalized = normalizeText(value)
  if (!normalized) return null

  try {
    const parsed = new URL(normalized)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.href : null
  } catch {
    return null
  }
}

function normalizeMetadata(data) {
  return {
    title: normalizeText(data.title),
    description: normalizeText(data.description),
    imageUrl: normalizeAssetUrl(isObject(data.image) ? data.image.url : null),
    faviconUrl: normalizeAssetUrl(isObject(data.logo) ? data.logo.url : null),
  }
}

function getTimeoutMs(timeoutMs) {
  return Number.isFinite(timeoutMs) && timeoutMs >= 0 ? timeoutMs : DEFAULT_TIMEOUT_MS
}

export async function fetchLinkMetadata(
  normalizedUrl,
  { fetchImpl = globalThis.fetch, timeoutMs = DEFAULT_TIMEOUT_MS } = {},
) {
  if (typeof fetchImpl !== 'function') {
    throw new MetadataServiceError('request-failed')
  }

  const endpoint = new URL(MICROLINK_ENDPOINT)
  endpoint.search = new URLSearchParams({ url: normalizedUrl }).toString()

  const controller = new AbortController()
  let didTimeout = false
  const timeoutId = setTimeout(() => {
    didTimeout = true
    controller.abort()
  }, getTimeoutMs(timeoutMs))

  try {
    let response

    try {
      response = await fetchImpl(endpoint.href, { signal: controller.signal })
    } catch (error) {
      throw new MetadataServiceError(didTimeout ? 'timeout' : 'request-failed', {
        cause: error,
      })
    }

    if (!isObject(response) || typeof response.ok !== 'boolean') {
      throw new MetadataServiceError('invalid-response')
    }

    if (response.status === 429) {
      throw new MetadataServiceError('rate-limit')
    }

    if (!response.ok) {
      throw new MetadataServiceError('request-failed')
    }

    let payload
    try {
      payload = await response.json()
    } catch (error) {
      throw new MetadataServiceError(didTimeout ? 'timeout' : 'invalid-response', {
        cause: error,
      })
    }

    if (!isObject(payload) || !isObject(payload.data)) {
      throw new MetadataServiceError('invalid-response')
    }

    return normalizeMetadata(payload.data)
  } finally {
    clearTimeout(timeoutId)
  }
}
