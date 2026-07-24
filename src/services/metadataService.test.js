import test from 'node:test'
import assert from 'node:assert/strict'
import { MetadataServiceError, fetchLinkMetadata } from './metadataService.js'

function createResponse({ ok = true, status = 200, payload = { data: {} } } = {}) {
  return {
    ok,
    status,
    json: async () => payload,
  }
}

async function assertServiceError(promise, expectedCode) {
  await assert.rejects(promise, (error) => {
    assert.equal(error instanceof MetadataServiceError, true)
    assert.equal(error.code, expectedCode)
    return true
  })
}

test('constructs the Microlink endpoint and encodes the submitted URL', async () => {
  const submittedUrl = 'https://example.com/search?q=research notes&tag=a/b'
  let requestUrl
  let requestOptions
  const fetchImpl = async (url, options) => {
    requestUrl = url
    requestOptions = options
    return createResponse()
  }

  await fetchLinkMetadata(submittedUrl, { fetchImpl })

  const parsed = new URL(requestUrl)
  assert.equal(parsed.origin, 'https://api.microlink.io')
  assert.equal(parsed.pathname, '/')
  assert.equal(parsed.searchParams.get('url'), submittedUrl)
  assert.match(requestUrl, /research\+notes/)
  assert.equal(requestOptions.signal instanceof AbortSignal, true)
})

test('normalizes a complete metadata response', async () => {
  const fetchImpl = async () =>
    createResponse({
      payload: {
        data: {
          title: 'Example',
          description: 'An example page.',
          image: { url: 'https://example.com/preview.png' },
          logo: { url: 'https://example.com/favicon.ico' },
        },
      },
    })

  const result = await fetchLinkMetadata('https://example.com/', { fetchImpl })

  assert.deepEqual(result, {
    title: 'Example',
    description: 'An example page.',
    imageUrl: 'https://example.com/preview.png',
    faviconUrl: 'https://example.com/favicon.ico',
  })
})

test('trims title and description', async () => {
  const fetchImpl = async () =>
    createResponse({
      payload: {
        data: {
          title: '  Example title  ',
          description: '\n Example description \t',
        },
      },
    })

  const result = await fetchLinkMetadata('https://example.com/', { fetchImpl })

  assert.equal(result.title, 'Example title')
  assert.equal(result.description, 'Example description')
})

test('converts empty and invalid text values to null', async () => {
  const fetchImpl = async () =>
    createResponse({
      payload: {
        data: {
          title: '   ',
          description: 42,
        },
      },
    })

  const result = await fetchLinkMetadata('https://example.com/', { fetchImpl })

  assert.equal(result.title, null)
  assert.equal(result.description, null)
})

test('returns null for absent image and logo', async () => {
  const fetchImpl = async () => createResponse({ payload: { data: { title: 'Example' } } })

  const result = await fetchLinkMetadata('https://example.com/', { fetchImpl })

  assert.equal(result.imageUrl, null)
  assert.equal(result.faviconUrl, null)
})

test('returns null for malformed nested image and logo values', async () => {
  const fetchImpl = async () =>
    createResponse({
      payload: {
        data: {
          image: 'https://example.com/preview.png',
          logo: { url: 123 },
        },
      },
    })

  const result = await fetchLinkMetadata('https://example.com/', { fetchImpl })

  assert.equal(result.imageUrl, null)
  assert.equal(result.faviconUrl, null)
})

test('accepts only absolute HTTP or HTTPS asset URLs', async () => {
  const fetchImpl = async () =>
    createResponse({
      payload: {
        data: {
          image: { url: 'data:image/png;base64,abc' },
          logo: { url: '/favicon.ico' },
        },
      },
    })

  const result = await fetchLinkMetadata('https://example.com/', { fetchImpl })

  assert.equal(result.imageUrl, null)
  assert.equal(result.faviconUrl, null)
})

test('returns valid partial metadata', async () => {
  const fetchImpl = async () =>
    createResponse({
      payload: {
        data: {
          title: 'Partial example',
          description: '',
          image: { url: 'http://images.example.com/preview.jpg' },
        },
      },
    })

  const result = await fetchLinkMetadata('https://example.com/', { fetchImpl })

  assert.deepEqual(result, {
    title: 'Partial example',
    description: null,
    imageUrl: 'http://images.example.com/preview.jpg',
    faviconUrl: null,
  })
})

test('maps HTTP 429 to the rate-limit error code', async () => {
  const fetchImpl = async () => createResponse({ ok: false, status: 429 })

  await assertServiceError(
    fetchLinkMetadata('https://example.com/', { fetchImpl }),
    'rate-limit',
  )
})

test('maps another non-success response to request-failed', async () => {
  const fetchImpl = async () => createResponse({ ok: false, status: 503 })

  await assertServiceError(
    fetchLinkMetadata('https://example.com/', { fetchImpl }),
    'request-failed',
  )
})

test('maps a rejected fetch to request-failed', async () => {
  const fetchImpl = async () => {
    throw new TypeError('Network unavailable')
  }

  await assertServiceError(
    fetchLinkMetadata('https://example.com/', { fetchImpl }),
    'request-failed',
  )
})

test('maps unreadable JSON to invalid-response', async () => {
  const fetchImpl = async () => ({
    ok: true,
    status: 200,
    json: async () => {
      throw new SyntaxError('Unexpected token')
    },
  })

  await assertServiceError(
    fetchLinkMetadata('https://example.com/', { fetchImpl }),
    'invalid-response',
  )
})

test('rejects missing or malformed top-level data', async (context) => {
  const invalidPayloads = [null, {}, { data: null }, { data: [] }, { data: 'invalid' }]

  for (const payload of invalidPayloads) {
    await context.test(JSON.stringify(payload), async () => {
      const fetchImpl = async () => createResponse({ payload })

      await assertServiceError(
        fetchLinkMetadata('https://example.com/', { fetchImpl }),
        'invalid-response',
      )
    })
  }
})

test('aborts a timed-out request and maps it to timeout', async () => {
  let receivedSignal
  const fetchImpl = async (_url, { signal }) => {
    receivedSignal = signal
    return new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => {
        const error = new Error('Aborted')
        error.name = 'AbortError'
        reject(error)
      })
    })
  }

  await assertServiceError(
    fetchLinkMetadata('https://example.com/', { fetchImpl, timeoutMs: 5 }),
    'timeout',
  )
  assert.equal(receivedSignal.aborted, true)
})

test('clears the timeout after success', async (context) => {
  const timeoutId = { id: 'success-timeout' }
  const setTimeoutMock = context.mock.method(globalThis, 'setTimeout', () => timeoutId)
  const clearTimeoutMock = context.mock.method(globalThis, 'clearTimeout', () => {})
  const fetchImpl = async () => createResponse()

  await fetchLinkMetadata('https://example.com/', { fetchImpl })

  assert.equal(setTimeoutMock.mock.callCount(), 1)
  assert.equal(clearTimeoutMock.mock.callCount(), 1)
  assert.equal(clearTimeoutMock.mock.calls[0].arguments[0], timeoutId)
})

test('clears the timeout after failure', async (context) => {
  const timeoutId = { id: 'failure-timeout' }
  const setTimeoutMock = context.mock.method(globalThis, 'setTimeout', () => timeoutId)
  const clearTimeoutMock = context.mock.method(globalThis, 'clearTimeout', () => {})
  const fetchImpl = async () => {
    throw new TypeError('Network unavailable')
  }

  await assertServiceError(
    fetchLinkMetadata('https://example.com/', { fetchImpl }),
    'request-failed',
  )
  assert.equal(setTimeoutMock.mock.callCount(), 1)
  assert.equal(clearTimeoutMock.mock.callCount(), 1)
  assert.equal(clearTimeoutMock.mock.calls[0].arguments[0], timeoutId)
})

test('excludes provider-returned URL and domain from the result', async () => {
  const fetchImpl = async () =>
    createResponse({
      payload: {
        data: {
          title: 'Example',
          url: 'https://provider-redirect.example/',
          domain: 'provider-redirect.example',
        },
      },
    })

  const result = await fetchLinkMetadata('https://example.com/', { fetchImpl })

  assert.deepEqual(Object.keys(result), ['title', 'description', 'imageUrl', 'faviconUrl'])
  assert.equal('url' in result, false)
  assert.equal('domain' in result, false)
})
