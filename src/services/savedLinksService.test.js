import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  SavedLinksServiceError,
  createSavedLinksService,
} from './savedLinksService.js'

const completeLink = {
  url: 'https://example.com/article',
  domain: 'example.com',
  title: ' Example title ',
  description: ' Example description ',
  imageUrl: 'https://example.com/preview.jpg',
  faviconUrl: 'https://example.com/favicon.ico',
}

function createMocks(overrides = {}) {
  const calls = {
    collections: [],
    deletes: [],
    docs: [],
    getDocs: [],
    queries: [],
    writes: [],
  }
  const timestamp = { kind: 'server-timestamp' }

  const dependencies = {
    collectionImpl(...args) {
      calls.collections.push(args)
      return { kind: 'collection', args }
    },
    deleteDocImpl(reference) {
      calls.deletes.push(reference)
      return Promise.resolve()
    },
    docImpl(...args) {
      calls.docs.push(args)
      return args.length === 1
        ? { kind: 'document', id: 'generated-id', parent: args[0] }
        : { kind: 'document', args }
    },
    getDocsImpl(requestQuery) {
      calls.getDocs.push(requestQuery)
      return Promise.resolve({ empty: true, docs: [] })
    },
    limitImpl(value) {
      return { kind: 'limit', value }
    },
    orderByImpl(field, direction) {
      return { kind: 'orderBy', field, direction }
    },
    queryImpl(reference, ...constraints) {
      const requestQuery = { kind: 'query', reference, constraints }
      calls.queries.push(requestQuery)
      return requestQuery
    },
    serverTimestampImpl() {
      return timestamp
    },
    setDocImpl(reference, value) {
      calls.writes.push({ reference, value })
      return Promise.resolve()
    },
    whereImpl(field, operator, value) {
      return { kind: 'where', field, operator, value }
    },
    ...overrides,
  }

  return {
    calls,
    service: createSavedLinksService(dependencies),
    timestamp,
  }
}

function assertServiceError(error, code, cause) {
  assert.ok(error instanceof SavedLinksServiceError)
  assert.equal(error.code, code)

  if (cause !== undefined) {
    assert.equal(error.cause, cause)
  }

  return true
}

describe('savedLinksService', () => {
  it('queries for duplicates within the authenticated user collection', async () => {
    const { calls, service } = createMocks()

    await service.saveLink({ db: 'database', uid: 'user-1', link: completeLink })

    assert.deepEqual(calls.collections, [
      ['database', 'users', 'user-1', 'savedLinks'],
    ])
    assert.deepEqual(calls.queries[0].constraints, [
      {
        kind: 'where',
        field: 'url',
        operator: '==',
        value: 'https://example.com/article',
      },
      { kind: 'limit', value: 1 },
    ])
  })

  it('rejects a duplicate without creating or writing a document', async () => {
    const { calls, service } = createMocks({
      getDocsImpl: async () => ({ empty: false, docs: [{ id: 'existing' }] }),
    })

    await assert.rejects(
      service.saveLink({
        db: 'database',
        uid: 'user-1',
        link: completeLink,
      }),
      (error) => assertServiceError(error, 'duplicate-saved-link'),
    )
    assert.equal(calls.docs.length, 0)
    assert.equal(calls.writes.length, 0)
  })

  it('creates a saved link with a Firestore-generated document reference', async () => {
    const { calls, service } = createMocks()

    const result = await service.saveLink({
      db: 'database',
      uid: 'user-1',
      link: completeLink,
    })

    assert.equal(calls.docs.length, 1)
    assert.equal(calls.docs[0].length, 1)
    assert.equal(calls.docs[0][0], calls.queries[0].reference)
    assert.equal(result.id, 'generated-id')
  })

  it('writes only normalized card fields and a server timestamp', async () => {
    const { calls, service, timestamp } = createMocks()

    const result = await service.saveLink({
      db: 'database',
      uid: 'user-1',
      link: {
        ...completeLink,
        id: 'transient-card-id',
        loading: true,
        providerUrl: 'https://provider.example/redirect',
      },
    })

    assert.deepEqual(calls.writes[0].value, {
      url: 'https://example.com/article',
      domain: 'example.com',
      title: 'Example title',
      description: 'Example description',
      imageUrl: 'https://example.com/preview.jpg',
      faviconUrl: 'https://example.com/favicon.ico',
      createdAt: timestamp,
    })
    assert.deepEqual(result, {
      id: 'generated-id',
      url: 'https://example.com/article',
      domain: 'example.com',
      title: 'Example title',
      description: 'Example description',
      imageUrl: 'https://example.com/preview.jpg',
      faviconUrl: 'https://example.com/favicon.ico',
    })
  })

  it('normalizes optional blank fields to null', async () => {
    const { calls, service } = createMocks()

    await service.saveLink({
      db: 'database',
      uid: 'user-1',
      link: {
        ...completeLink,
        title: ' ',
        description: null,
        imageUrl: undefined,
        faviconUrl: '',
      },
    })

    assert.equal(calls.writes[0].value.title, null)
    assert.equal(calls.writes[0].value.description, null)
    assert.equal(calls.writes[0].value.imageUrl, null)
    assert.equal(calls.writes[0].value.faviconUrl, null)
  })

  it('lists links using a createdAt descending Firestore query', async () => {
    const { calls, service } = createMocks()

    await service.listSavedLinks({ db: 'database', uid: 'user-2' })

    assert.deepEqual(calls.collections, [
      ['database', 'users', 'user-2', 'savedLinks'],
    ])
    assert.deepEqual(calls.queries[0].constraints, [
      { kind: 'orderBy', field: 'createdAt', direction: 'desc' },
    ])
  })

  it('returns normalized plain link objects with document IDs and ISO dates', async () => {
    let dataCallCount = 0
    const storedData = {
      ...completeLink,
      title: ' Stored title ',
      createdAt: {
        toDate: () => new Date('2026-07-20T12:00:00.000Z'),
      },
    }
    const { service } = createMocks({
      getDocsImpl: async () => ({
        empty: false,
        docs: [
          {
            id: 'saved-1',
            data: () => {
              dataCallCount += 1
              return storedData
            },
          },
        ],
      }),
    })

    const result = await service.listSavedLinks({
      db: 'database',
      uid: 'user-1',
    })

    assert.deepEqual(result, [
      {
        id: 'saved-1',
        url: 'https://example.com/article',
        domain: 'example.com',
        title: 'Stored title',
        description: 'Example description',
        imageUrl: 'https://example.com/preview.jpg',
        faviconUrl: 'https://example.com/favicon.ico',
        createdAt: '2026-07-20T12:00:00.000Z',
      },
    ])
    assert.notEqual(result[0], storedData)
    assert.equal(typeof result[0].createdAt, 'string')
    assert.equal(dataCallCount, 1)
  })

  it('returns an empty array for an empty saved-links snapshot', async () => {
    const { service } = createMocks()

    assert.deepEqual(
      await service.listSavedLinks({ db: 'database', uid: 'user-1' }),
      [],
    )
  })

  it('deletes only the validated per-user saved-link path', async () => {
    const { calls, service } = createMocks()

    await service.deleteSavedLink({
      db: 'database',
      uid: 'user-1',
      linkId: 'saved-1',
    })

    assert.deepEqual(calls.docs, [
      ['database', 'users', 'user-1', 'savedLinks', 'saved-1'],
    ])
    assert.equal(calls.deletes[0].args.at(-1), 'saved-1')
  })

  it('rejects malformed authenticated user IDs before calling Firestore', async () => {
    const { calls, service } = createMocks()

    await assert.rejects(
      service.listSavedLinks({ db: 'database', uid: 'users/bad' }),
      (error) => assertServiceError(error, 'invalid-user-id'),
    )
    assert.equal(calls.collections.length, 0)
  })

  it('rejects malformed saved-link data before calling Firestore', async () => {
    const { calls, service } = createMocks()

    await assert.rejects(
      service.saveLink({
        db: 'database',
        uid: 'user-1',
        link: { ...completeLink, domain: 'wrong.example' },
      }),
      (error) => assertServiceError(error, 'invalid-saved-link'),
    )
    await assert.rejects(
      service.saveLink({
        db: 'database',
        uid: 'user-1',
        link: { ...completeLink, imageUrl: 'javascript:alert(1)' },
      }),
      (error) => assertServiceError(error, 'invalid-saved-link'),
    )
    assert.equal(calls.collections.length, 0)
  })

  it('rejects malformed document IDs before calling Firestore', async () => {
    const { calls, service } = createMocks()

    await assert.rejects(
      service.deleteSavedLink({
        db: 'database',
        uid: 'user-1',
        linkId: 'saved/bad',
      }),
      (error) => assertServiceError(error, 'invalid-saved-link-id'),
    )
    assert.equal(calls.docs.length, 0)
  })

  it('wraps duplicate-query failures and preserves their cause', async () => {
    const cause = new Error('query unavailable')
    const { service } = createMocks({
      getDocsImpl: async () => {
        throw cause
      },
    })

    await assert.rejects(
      service.saveLink({
        db: 'database',
        uid: 'user-1',
        link: completeLink,
      }),
      (error) =>
        assertServiceError(error, 'firestore-request-failed', cause),
    )
  })

  it('wraps write failures and preserves their cause', async () => {
    const cause = new Error('write unavailable')
    const { service } = createMocks({
      setDocImpl: async () => {
        throw cause
      },
    })

    await assert.rejects(
      service.saveLink({
        db: 'database',
        uid: 'user-1',
        link: completeLink,
      }),
      (error) =>
        assertServiceError(error, 'firestore-request-failed', cause),
    )
  })

  it('wraps list failures and preserves their cause', async () => {
    const cause = new Error('list unavailable')
    const { service } = createMocks({
      getDocsImpl: async () => {
        throw cause
      },
    })

    await assert.rejects(
      service.listSavedLinks({ db: 'database', uid: 'user-1' }),
      (error) =>
        assertServiceError(error, 'firestore-request-failed', cause),
    )
  })

  it('wraps delete failures and preserves their cause', async () => {
    const cause = new Error('delete unavailable')
    const { service } = createMocks({
      deleteDocImpl: async () => {
        throw cause
      },
    })

    await assert.rejects(
      service.deleteSavedLink({
        db: 'database',
        uid: 'user-1',
        linkId: 'saved-1',
      }),
      (error) =>
        assertServiceError(error, 'firestore-request-failed', cause),
    )
  })

  it('keeps dependencies isolated between separate service factories', async () => {
    const first = createMocks()
    const second = createMocks()

    await first.service.saveLink({
      db: 'first-db',
      uid: 'first-user',
      link: completeLink,
    })
    await second.service.listSavedLinks({
      db: 'second-db',
      uid: 'second-user',
    })

    assert.deepEqual(first.calls.collections, [
      ['first-db', 'users', 'first-user', 'savedLinks'],
    ])
    assert.deepEqual(second.calls.collections, [
      ['second-db', 'users', 'second-user', 'savedLinks'],
    ])
    assert.equal(first.calls.writes.length, 1)
    assert.equal(second.calls.writes.length, 0)
  })
})
