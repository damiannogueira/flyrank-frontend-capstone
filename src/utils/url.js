// Pure validation/normalization helpers for ContextClip URL cards.
// No React, no side effects — kept easily testable with node:test.

export function isBlank(input) {
  return typeof input !== 'string' || input.trim().length === 0
}

// Matches an explicit URI scheme at the start of a string, e.g. "https:",
// "mailto:", "custom.scheme:". Per RFC 3986: letter, then letters/digits/+/-/.
const SCHEME_PATTERN = /^[a-zA-Z][a-zA-Z\d+.-]*:/

/**
 * Returns a normalized absolute URL string (e.g. "https://github.com/")
 * or null if the input cannot be turned into a valid http(s) URL.
 *
 * Valid means:
 *  - protocol is http: or https:
 *  - a hostname exists
 *  - the hostname contains at least one dot
 *
 * If the input has an explicit scheme, that scheme must already be
 * http/https — no other explicit scheme is rewritten. https:// is only
 * prepended when the input has no explicit scheme at all.
 */
export function normalizeUrl(input) {
  if (isBlank(input)) return null

  const trimmed = input.trim()
  const schemeMatch = trimmed.match(SCHEME_PATTERN)

  let candidate
  if (schemeMatch) {
    const scheme = schemeMatch[0].toLowerCase()
    if (scheme !== 'http:' && scheme !== 'https:') {
      return null
    }
    candidate = trimmed
  } else {
    candidate = `https://${trimmed}`
  }

  let parsed
  try {
    parsed = new URL(candidate)
  } catch {
    return null
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return null
  }
  if (!parsed.hostname) {
    return null
  }
  if (!parsed.hostname.includes('.')) {
    return null
  }

  return parsed.href
}

/**
 * Returns a display-friendly domain (leading "www." stripped) from an
 * already-normalized URL string.
 */
export function getDomain(normalizedUrl) {
  const parsed = new URL(normalizedUrl)
  return parsed.hostname.replace(/^www\./i, '')
}

/**
 * Validates raw user input and returns either:
 *  { valid: true, normalized }
 *  { valid: false, reason: 'blank' | 'invalid' }
 */
export function validateUrl(input) {
  if (isBlank(input)) {
    return { valid: false, reason: 'blank' }
  }
  const normalized = normalizeUrl(input)
  if (!normalized) {
    return { valid: false, reason: 'invalid' }
  }
  return { valid: true, normalized }
}
