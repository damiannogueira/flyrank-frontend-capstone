import test from 'node:test'
import assert from 'node:assert/strict'
import {
  AnonymousAuthError,
  createAnonymousUserEnsurer,
} from './authService.js'

const anonymousUser = {
  uid: 'anonymous-user-id',
  isAnonymous: true,
}

function createObserver(initialUser, { observerError, onUnsubscribe } = {}) {
  return (_auth, handleUser, handleError) => {
    if (observerError) {
      handleError(observerError)
    } else {
      handleUser(initialUser)
    }

    return () => onUnsubscribe?.()
  }
}

async function assertAuthError(promise) {
  await assert.rejects(promise, (error) => {
    assert.equal(error instanceof AnonymousAuthError, true)
    assert.equal(error.code, 'firebase-authentication-error')
    return true
  })
}

test('returns a restored existing user without anonymous sign-in', async () => {
  let signInCalls = 0
  const ensureAnonymousUser = createAnonymousUserEnsurer({
    onAuthStateChangedImpl: createObserver(anonymousUser),
    signInAnonymouslyImpl: async () => {
      signInCalls += 1
      return { user: anonymousUser }
    },
  })

  const result = await ensureAnonymousUser({ auth: {} })

  assert.deepEqual(result, {
    uid: 'anonymous-user-id',
    isAnonymous: true,
    user: anonymousUser,
  })
  assert.equal(signInCalls, 0)
})

test('a signed-out initial state triggers one anonymous sign-in', async () => {
  let signInCalls = 0
  const ensureAnonymousUser = createAnonymousUserEnsurer({
    onAuthStateChangedImpl: createObserver(null),
    signInAnonymouslyImpl: async () => {
      signInCalls += 1
      return { user: anonymousUser }
    },
  })

  const result = await ensureAnonymousUser({ auth: {} })

  assert.equal(result.uid, 'anonymous-user-id')
  assert.equal(signInCalls, 1)
})

test('normalizes the authenticated user result', async () => {
  const user = {
    uid: 'restored-user',
    isAnonymous: false,
    additionalProperty: 'preserved',
  }
  const ensureAnonymousUser = createAnonymousUserEnsurer({
    onAuthStateChangedImpl: createObserver(user),
    signInAnonymouslyImpl: async () => ({ user: anonymousUser }),
  })

  const result = await ensureAnonymousUser({ auth: {} })

  assert.deepEqual(result, {
    uid: 'restored-user',
    isAnonymous: false,
    user,
  })
})

test('concurrent callers reuse one promise, observer, and sign-in', async () => {
  let observerCalls = 0
  let signInCalls = 0
  let resolveSignIn
  const auth = {}
  const ensureAnonymousUser = createAnonymousUserEnsurer({
    onAuthStateChangedImpl: (...args) => {
      observerCalls += 1
      return createObserver(null)(...args)
    },
    signInAnonymouslyImpl: () => {
      signInCalls += 1
      return new Promise((resolve) => {
        resolveSignIn = resolve
      })
    },
  })

  const firstPromise = ensureAnonymousUser({ auth })
  const secondPromise = ensureAnonymousUser({ auth })
  resolveSignIn({ user: anonymousUser })
  const [firstResult, secondResult] = await Promise.all([
    firstPromise,
    secondPromise,
  ])

  assert.equal(firstPromise, secondPromise)
  assert.equal(firstResult, secondResult)
  assert.equal(observerCalls, 1)
  assert.equal(signInCalls, 1)
})

test('maps observer errors to a stable authentication error', async () => {
  const ensureAnonymousUser = createAnonymousUserEnsurer({
    onAuthStateChangedImpl: createObserver(null, {
      observerError: new Error('Observer failed'),
    }),
    signInAnonymouslyImpl: async () => ({ user: anonymousUser }),
  })

  await assertAuthError(ensureAnonymousUser({ auth: {} }))
})

test('maps anonymous sign-in errors to a stable authentication error', async () => {
  const ensureAnonymousUser = createAnonymousUserEnsurer({
    onAuthStateChangedImpl: createObserver(null),
    signInAnonymouslyImpl: async () => {
      throw new Error('Sign-in failed')
    },
  })

  await assertAuthError(ensureAnonymousUser({ auth: {} }))
})

test('rejects malformed or missing users', async (context) => {
  const malformedUsers = [
    null,
    {},
    { uid: '', isAnonymous: true },
    { uid: 'user-id' },
    { uid: 'user-id', isAnonymous: 'true' },
  ]

  for (const user of malformedUsers) {
    await context.test(JSON.stringify(user), async () => {
      const ensureAnonymousUser = createAnonymousUserEnsurer({
        onAuthStateChangedImpl: createObserver(null),
        signInAnonymouslyImpl: async () => ({ user }),
      })

      await assertAuthError(ensureAnonymousUser({ auth: {} }))
    })
  }
})

test('caches authentication failures without retrying', async () => {
  let observerCalls = 0
  let signInCalls = 0
  const auth = {}
  const ensureAnonymousUser = createAnonymousUserEnsurer({
    onAuthStateChangedImpl: (...args) => {
      observerCalls += 1
      return createObserver(null)(...args)
    },
    signInAnonymouslyImpl: async () => {
      signInCalls += 1
      throw new Error('Sign-in failed')
    },
  })

  const firstPromise = ensureAnonymousUser({ auth })
  await assertAuthError(firstPromise)
  const secondPromise = ensureAnonymousUser({ auth })
  await assertAuthError(secondPromise)

  assert.equal(firstPromise, secondPromise)
  assert.equal(observerCalls, 1)
  assert.equal(signInCalls, 1)
})

test('unsubscribes after restored-user success', async () => {
  let unsubscribeCalls = 0
  const ensureAnonymousUser = createAnonymousUserEnsurer({
    onAuthStateChangedImpl: createObserver(anonymousUser, {
      onUnsubscribe: () => {
        unsubscribeCalls += 1
      },
    }),
    signInAnonymouslyImpl: async () => ({ user: anonymousUser }),
  })

  await ensureAnonymousUser({ auth: {} })

  assert.equal(unsubscribeCalls, 1)
})

test('unsubscribes after authentication failure', async () => {
  let unsubscribeCalls = 0
  const ensureAnonymousUser = createAnonymousUserEnsurer({
    onAuthStateChangedImpl: createObserver(null, {
      onUnsubscribe: () => {
        unsubscribeCalls += 1
      },
    }),
    signInAnonymouslyImpl: async () => {
      throw new Error('Sign-in failed')
    },
  })

  await assertAuthError(ensureAnonymousUser({ auth: {} }))

  assert.equal(unsubscribeCalls, 1)
})

test('separate ensurer factories have isolated caches', async () => {
  let observerCalls = 0
  const dependencies = {
    onAuthStateChangedImpl: (...args) => {
      observerCalls += 1
      return createObserver(anonymousUser)(...args)
    },
    signInAnonymouslyImpl: async () => ({ user: anonymousUser }),
  }
  const auth = {}

  await createAnonymousUserEnsurer(dependencies)({ auth })
  await createAnonymousUserEnsurer(dependencies)({ auth })

  assert.equal(observerCalls, 2)
})
