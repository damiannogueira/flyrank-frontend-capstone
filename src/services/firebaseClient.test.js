import test from 'node:test'
import assert from 'node:assert/strict'
import {
  FirebaseClientError,
  createFirebaseClientGetter,
} from './firebaseClient.js'

const validEnv = {
  VITE_FIREBASE_API_KEY: 'api-key',
  VITE_FIREBASE_AUTH_DOMAIN: 'contextclip.firebaseapp.com',
  VITE_FIREBASE_PROJECT_ID: 'contextclip-project',
  VITE_FIREBASE_APP_ID: 'app-id',
}

function createDependencies(overrides = {}) {
  const app = { name: '[DEFAULT]' }

  return {
    initializeAppImpl: () => app,
    getAppsImpl: () => [],
    getAppImpl: () => app,
    getAuthImpl: (selectedApp) => ({ app: selectedApp, type: 'auth' }),
    getFirestoreImpl: (selectedApp) => ({ app: selectedApp, type: 'firestore' }),
    ...overrides,
  }
}

async function assertClientError(promise, expectedCode) {
  await assert.rejects(promise, (error) => {
    assert.equal(error instanceof FirebaseClientError, true)
    assert.equal(error.code, expectedCode)
    return true
  })
}

test('maps valid environment configuration without forwarding extra fields', async () => {
  let receivedConfig
  const dependencies = createDependencies({
    initializeAppImpl: (config) => {
      receivedConfig = config
      return { name: '[DEFAULT]' }
    },
  })
  const getFirebaseClient = createFirebaseClientGetter(dependencies)

  await getFirebaseClient({
    env: {
      ...validEnv,
      VITE_UNRELATED_VALUE: 'do-not-forward',
    },
  })

  assert.deepEqual(receivedConfig, {
    apiKey: 'api-key',
    authDomain: 'contextclip.firebaseapp.com',
    projectId: 'contextclip-project',
    appId: 'app-id',
  })
})

test('trims required configuration values', async () => {
  let receivedConfig
  const getFirebaseClient = createFirebaseClientGetter(
    createDependencies({
      initializeAppImpl: (config) => {
        receivedConfig = config
        return { name: '[DEFAULT]' }
      },
    }),
  )

  await getFirebaseClient({
    env: Object.fromEntries(
      Object.entries(validEnv).map(([key, value]) => [key, `  ${value}  `]),
    ),
  })

  assert.deepEqual(receivedConfig, {
    apiKey: 'api-key',
    authDomain: 'contextclip.firebaseapp.com',
    projectId: 'contextclip-project',
    appId: 'app-id',
  })
})

test('rejects each missing or blank required variable', async (context) => {
  for (const key of Object.keys(validEnv)) {
    await context.test(`${key} missing`, async () => {
      const env = { ...validEnv }
      delete env[key]
      const getFirebaseClient = createFirebaseClientGetter(createDependencies())

      await assertClientError(
        getFirebaseClient({ env }),
        'firebase-configuration-error',
      )
    })

    await context.test(`${key} blank`, async () => {
      const getFirebaseClient = createFirebaseClientGetter(createDependencies())

      await assertClientError(
        getFirebaseClient({ env: { ...validEnv, [key]: '   ' } }),
        'firebase-configuration-error',
      )
    })
  }
})

test('creating a getter does not initialize Firebase', () => {
  let initializeCalls = 0

  createFirebaseClientGetter(
    createDependencies({
      initializeAppImpl: () => {
        initializeCalls += 1
        return { name: '[DEFAULT]' }
      },
    }),
  )

  assert.equal(initializeCalls, 0)
})

test('initializes exactly once when no app exists', async () => {
  let initializeCalls = 0
  const getFirebaseClient = createFirebaseClientGetter(
    createDependencies({
      initializeAppImpl: () => {
        initializeCalls += 1
        return { name: '[DEFAULT]' }
      },
    }),
  )

  await getFirebaseClient({ env: validEnv })

  assert.equal(initializeCalls, 1)
})

test('reuses an existing app without initializing another', async () => {
  const existingApp = { name: '[DEFAULT]' }
  let initializeCalls = 0
  let getAppCalls = 0
  const getFirebaseClient = createFirebaseClientGetter(
    createDependencies({
      getAppsImpl: () => [existingApp],
      getAppImpl: () => {
        getAppCalls += 1
        return existingApp
      },
      initializeAppImpl: () => {
        initializeCalls += 1
        return { name: '[DEFAULT]' }
      },
    }),
  )

  const result = await getFirebaseClient({ env: validEnv })

  assert.equal(result.app, existingApp)
  assert.equal(getAppCalls, 1)
  assert.equal(initializeCalls, 0)
})

test('passes the selected app to Auth and Firestore', async () => {
  const selectedApp = { name: '[DEFAULT]' }
  let authApp
  let firestoreApp
  const getFirebaseClient = createFirebaseClientGetter(
    createDependencies({
      initializeAppImpl: () => selectedApp,
      getAuthImpl: (app) => {
        authApp = app
        return { type: 'auth' }
      },
      getFirestoreImpl: (app) => {
        firestoreApp = app
        return { type: 'firestore' }
      },
    }),
  )

  await getFirebaseClient({ env: validEnv })

  assert.equal(authApp, selectedApp)
  assert.equal(firestoreApp, selectedApp)
})

test('repeated calls reuse the same promise and result', async () => {
  let initializeCalls = 0
  const getFirebaseClient = createFirebaseClientGetter(
    createDependencies({
      initializeAppImpl: () => {
        initializeCalls += 1
        return { name: '[DEFAULT]' }
      },
    }),
  )

  const firstPromise = getFirebaseClient({ env: validEnv })
  const secondPromise = getFirebaseClient({ env: validEnv })
  const [firstResult, secondResult] = await Promise.all([
    firstPromise,
    secondPromise,
  ])

  assert.equal(firstPromise, secondPromise)
  assert.equal(firstResult, secondResult)
  assert.equal(initializeCalls, 1)
})

test('maps initialization failures to a stable error', async () => {
  const getFirebaseClient = createFirebaseClientGetter(
    createDependencies({
      initializeAppImpl: () => {
        throw new Error('Initialization failed')
      },
    }),
  )

  await assertClientError(
    getFirebaseClient({ env: validEnv }),
    'firebase-initialization-error',
  )
})

test('caches an initialization rejection without retrying', async () => {
  let initializeCalls = 0
  const getFirebaseClient = createFirebaseClientGetter(
    createDependencies({
      initializeAppImpl: () => {
        initializeCalls += 1
        throw new Error('Initialization failed')
      },
    }),
  )

  const firstPromise = getFirebaseClient({ env: validEnv })
  await assertClientError(firstPromise, 'firebase-initialization-error')
  const secondPromise = getFirebaseClient({ env: validEnv })
  await assertClientError(secondPromise, 'firebase-initialization-error')

  assert.equal(firstPromise, secondPromise)
  assert.equal(initializeCalls, 1)
})

test('separate getter factories have isolated caches', async () => {
  let initializeCalls = 0
  const dependencies = createDependencies({
    initializeAppImpl: () => {
      initializeCalls += 1
      return { name: '[DEFAULT]' }
    },
  })

  await createFirebaseClientGetter(dependencies)({ env: validEnv })
  await createFirebaseClientGetter(dependencies)({ env: validEnv })

  assert.equal(initializeCalls, 2)
})
