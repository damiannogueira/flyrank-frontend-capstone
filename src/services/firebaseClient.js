import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const REQUIRED_CONFIG = {
  VITE_FIREBASE_API_KEY: 'apiKey',
  VITE_FIREBASE_AUTH_DOMAIN: 'authDomain',
  VITE_FIREBASE_PROJECT_ID: 'projectId',
  VITE_FIREBASE_APP_ID: 'appId',
}

export class FirebaseClientError extends Error {
  constructor(code, options) {
    super(code, options)
    this.name = 'FirebaseClientError'
    this.code = code
  }
}

function readFirebaseConfig(env) {
  if (!env || typeof env !== 'object') {
    throw new FirebaseClientError('firebase-configuration-error')
  }

  const config = {}

  for (const [environmentKey, configKey] of Object.entries(REQUIRED_CONFIG)) {
    const value = env[environmentKey]

    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new FirebaseClientError('firebase-configuration-error')
    }

    config[configKey] = value.trim()
  }

  return config
}

export function createFirebaseClientGetter({
  initializeAppImpl,
  getAppsImpl,
  getAppImpl,
  getAuthImpl,
  getFirestoreImpl,
}) {
  let cachedResult

  return function getFirebaseClient({ env } = {}) {
    if (cachedResult) return cachedResult

    cachedResult = Promise.resolve().then(() => {
      const config = readFirebaseConfig(env)

      try {
        const app =
          getAppsImpl().length > 0 ? getAppImpl() : initializeAppImpl(config)

        return {
          app,
          auth: getAuthImpl(app),
          db: getFirestoreImpl(app),
        }
      } catch (error) {
        throw new FirebaseClientError('firebase-initialization-error', {
          cause: error,
        })
      }
    })

    return cachedResult
  }
}

const getFirebaseClientImpl = createFirebaseClientGetter({
  initializeAppImpl: initializeApp,
  getAppsImpl: getApps,
  getAppImpl: getApp,
  getAuthImpl: getAuth,
  getFirestoreImpl: getFirestore,
})

export function getFirebaseClient({ env = import.meta.env } = {}) {
  return getFirebaseClientImpl({ env })
}
