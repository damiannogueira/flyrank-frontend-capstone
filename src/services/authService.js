import { onAuthStateChanged, signInAnonymously } from 'firebase/auth'

export class AnonymousAuthError extends Error {
  constructor(options) {
    super('firebase-authentication-error', options)
    this.name = 'AnonymousAuthError'
    this.code = 'firebase-authentication-error'
  }
}

function normalizeUser(user) {
  if (
    !user ||
    typeof user !== 'object' ||
    typeof user.uid !== 'string' ||
    user.uid.trim().length === 0 ||
    typeof user.isAnonymous !== 'boolean'
  ) {
    throw new AnonymousAuthError()
  }

  return {
    uid: user.uid,
    isAnonymous: user.isAnonymous,
    user,
  }
}

export function createAnonymousUserEnsurer({
  onAuthStateChangedImpl,
  signInAnonymouslyImpl,
}) {
  const initializationByAuth = new WeakMap()

  return function ensureAnonymousUser({ auth } = {}) {
    if (!auth || (typeof auth !== 'object' && typeof auth !== 'function')) {
      return Promise.reject(new AnonymousAuthError())
    }

    const cachedInitialization = initializationByAuth.get(auth)
    if (cachedInitialization) return cachedInitialization

    const initialization = new Promise((resolve, reject) => {
      let settled = false
      let signInStarted = false
      let unsubscribe
      let unsubscribeWhenAvailable = false

      const cleanup = () => {
        if (typeof unsubscribe === 'function') {
          unsubscribe()
        } else {
          unsubscribeWhenAvailable = true
        }
      }

      const settle = (settlePromise, value) => {
        if (settled) return
        settled = true
        cleanup()
        settlePromise(value)
      }

      const rejectWithAuthError = (error) => {
        const authError =
          error instanceof AnonymousAuthError
            ? error
            : new AnonymousAuthError({ cause: error })
        settle(reject, authError)
      }

      const handleUser = async (user) => {
        if (settled || signInStarted) return

        if (user) {
          try {
            settle(resolve, normalizeUser(user))
          } catch (error) {
            rejectWithAuthError(error)
          }
          return
        }

        signInStarted = true

        try {
          const credential = await signInAnonymouslyImpl(auth)
          settle(resolve, normalizeUser(credential?.user))
        } catch (error) {
          rejectWithAuthError(error)
        }
      }

      try {
        unsubscribe = onAuthStateChangedImpl(
          auth,
          handleUser,
          rejectWithAuthError,
        )

        if (unsubscribeWhenAvailable && typeof unsubscribe === 'function') {
          unsubscribe()
        }
      } catch (error) {
        rejectWithAuthError(error)
      }
    })

    initializationByAuth.set(auth, initialization)
    return initialization
  }
}

const ensureAnonymousUserImpl = createAnonymousUserEnsurer({
  onAuthStateChangedImpl: onAuthStateChanged,
  signInAnonymouslyImpl: signInAnonymously,
})

export function ensureAnonymousUser({ auth } = {}) {
  return ensureAnonymousUserImpl({ auth })
}
