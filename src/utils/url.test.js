import test from 'node:test'
import assert from 'node:assert/strict'
import { isBlank, normalizeUrl, getDomain, validateUrl } from './url.js'

test('isBlank', () => {
  assert.equal(isBlank(''), true)
  assert.equal(isBlank('   '), true)
  assert.equal(isBlank('a'), false)
})

test('normalizeUrl rejects "hello" (no scheme, no dot in hostname)', () => {
  assert.equal(normalizeUrl('hello'), null)
})

test('normalizeUrl rejects "https://hello" (explicit scheme, still no dot)', () => {
  assert.equal(normalizeUrl('https://hello'), null)
})

test('normalizeUrl accepts "github.com" and normalizes it', () => {
  assert.equal(normalizeUrl('github.com'), 'https://github.com/')
})

test('normalizeUrl preserves path and query string', () => {
  assert.equal(
    normalizeUrl('https://www.youtube.com/watch?v=abc'),
    'https://www.youtube.com/watch?v=abc'
  )
})

test('normalizeUrl lowercases scheme and hostname', () => {
  assert.equal(normalizeUrl('HTTPS://GitHub.com'), 'https://github.com/')
})

test('normalizeUrl rejects non-http(s) explicit schemes instead of rewriting them', () => {
  assert.equal(normalizeUrl('ftp://example.com'), null)
  assert.equal(normalizeUrl('mailto:user@example.com'), null)
  assert.equal(normalizeUrl('custom.scheme://example.com'), null)
})

test('normalizeUrl accepts a well-formed IPv4 URL (no special-casing)', () => {
  assert.equal(normalizeUrl('https://192.168.1.1'), 'https://192.168.1.1/')
})

test('getDomain strips leading www.', () => {
  assert.equal(getDomain('https://github.com/'), 'github.com')
  assert.equal(getDomain('https://www.youtube.com/watch?v=abc'), 'youtube.com')
})

test('validateUrl: blank input', () => {
  assert.deepEqual(validateUrl(''), { valid: false, reason: 'blank' })
})

test('validateUrl: invalid input', () => {
  assert.deepEqual(validateUrl('hello'), { valid: false, reason: 'invalid' })
})

test('validateUrl: invalid explicit scheme', () => {
  assert.deepEqual(validateUrl('mailto:user@example.com'), {
    valid: false,
    reason: 'invalid',
  })
})

test('validateUrl: valid input', () => {
  assert.deepEqual(validateUrl('github.com'), {
    valid: true,
    normalized: 'https://github.com/',
  })
})
