import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore'
import { getDomain, normalizeUrl } from '../utils/url.js'

const MAX_URL_LENGTH = 2048
const MAX_DOMAIN_LENGTH = 253
const MAX_TITLE_LENGTH = 500
const MAX_DESCRIPTION_LENGTH = 2000
const MAX_ID_LENGTH = 1500

const ERROR_MESSAGES = {
  'invalid-user-id': 'A valid authenticated user ID is required.',
  'invalid-saved-link': 'The saved link data is invalid.',
  'duplicate-saved-link': 'This link has already been saved.',
  'invalid-saved-link-id': 'A valid saved-link document ID is required.',
  'firestore-request-failed': 'The saved-links request failed.',
}

export class SavedLinksServiceError extends Error {
  constructor(code, options = {}) {
    super(ERROR_MESSAGES[code] ?? ERROR_MESSAGES['firestore-request-failed'], options)
    this.name = 'SavedLinksServiceError'
    this.code = code
  }
}

function createServiceError(code, cause) {
  return new SavedLinksServiceError(code, cause === undefined ? {} : { cause })
}

function normalizePathSegment(value, errorCode) {
  if (
    typeof value !== 'string' ||
    value.trim() === '' ||
    value.length > MAX_ID_LENGTH ||
    value.includes('/')
  ) {
    throw createServiceError(errorCode)
  }

  return value.trim()
}

function normalizeOptionalText(value, maximumLength) {
  if (value === null || value === undefined) {
    return null
  }

  if (typeof value !== 'string') {
    throw createServiceError('invalid-saved-link')
  }

  const normalizedValue = value.trim()

  if (normalizedValue === '') {
    return null
  }

  if (normalizedValue.length > maximumLength) {
    throw createServiceError('invalid-saved-link')
  }

  return normalizedValue
}

function normalizeOptionalWebUrl(value) {
  const normalizedValue = normalizeOptionalText(value, MAX_URL_LENGTH)

  if (normalizedValue === null) {
    return null
  }

  try {
    const parsedUrl = new URL(normalizedValue)

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      throw createServiceError('invalid-saved-link')
    }

    return parsedUrl.href
  } catch (error) {
    if (error instanceof SavedLinksServiceError) {
      throw error
    }

    throw createServiceError('invalid-saved-link', error)
  }
}

function normalizeLink(link) {
  if (link === null || typeof link !== 'object' || Array.isArray(link)) {
    throw createServiceError('invalid-saved-link')
  }

  const normalizedUrl = normalizeUrl(link.url)

  if (normalizedUrl === null || normalizedUrl.length > MAX_URL_LENGTH) {
    throw createServiceError('invalid-saved-link')
  }

  const expectedDomain = getDomain(normalizedUrl)

  if (
    typeof link.domain !== 'string' ||
    link.domain.trim() !== expectedDomain ||
    expectedDomain.length > MAX_DOMAIN_LENGTH
  ) {
    throw createServiceError('invalid-saved-link')
  }

  return {
    url: normalizedUrl,
    domain: expectedDomain,
    title: normalizeOptionalText(link.title, MAX_TITLE_LENGTH),
    description: normalizeOptionalText(
      link.description,
      MAX_DESCRIPTION_LENGTH,
    ),
    imageUrl: normalizeOptionalWebUrl(link.imageUrl),
    faviconUrl: normalizeOptionalWebUrl(link.faviconUrl),
  }
}

function normalizeCreatedAt(value) {
  let date

  try {
    date = value instanceof Date ? value : value?.toDate?.()
  } catch (error) {
    throw createServiceError('firestore-request-failed', error)
  }

  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw createServiceError('firestore-request-failed')
  }

  return date.toISOString()
}

function hasDocuments(snapshot) {
  return snapshot?.empty === false || snapshot?.docs?.length > 0
}

export function createSavedLinksService({
  collectionImpl = collection,
  deleteDocImpl = deleteDoc,
  docImpl = doc,
  getDocsImpl = getDocs,
  limitImpl = limit,
  orderByImpl = orderBy,
  queryImpl = query,
  serverTimestampImpl = serverTimestamp,
  setDocImpl = setDoc,
  whereImpl = where,
} = {}) {
  async function saveLink({ db, uid, link }) {
    const normalizedUid = normalizePathSegment(uid, 'invalid-user-id')
    const normalizedLink = normalizeLink(link)
    let linksCollection
    let duplicateSnapshot

    try {
      linksCollection = collectionImpl(
        db,
        'users',
        normalizedUid,
        'savedLinks',
      )
      const duplicateQuery = queryImpl(
        linksCollection,
        whereImpl('url', '==', normalizedLink.url),
        limitImpl(1),
      )
      duplicateSnapshot = await getDocsImpl(duplicateQuery)
    } catch (error) {
      throw createServiceError('firestore-request-failed', error)
    }

    if (hasDocuments(duplicateSnapshot)) {
      throw createServiceError('duplicate-saved-link')
    }

    let documentReference

    try {
      documentReference = docImpl(linksCollection)
      await setDocImpl(documentReference, {
        ...normalizedLink,
        createdAt: serverTimestampImpl(),
      })
    } catch (error) {
      throw createServiceError('firestore-request-failed', error)
    }

    return {
      id: documentReference.id,
      ...normalizedLink,
    }
  }

  async function listSavedLinks({ db, uid }) {
    const normalizedUid = normalizePathSegment(uid, 'invalid-user-id')
    let snapshot

    try {
      const linksCollection = collectionImpl(
        db,
        'users',
        normalizedUid,
        'savedLinks',
      )
      const savedLinksQuery = queryImpl(
        linksCollection,
        orderByImpl('createdAt', 'desc'),
      )
      snapshot = await getDocsImpl(savedLinksQuery)
    } catch (error) {
      throw createServiceError('firestore-request-failed', error)
    }

    try {
      return snapshot.docs.map((documentSnapshot) => {
        const documentData = documentSnapshot.data()

        return {
          id: normalizePathSegment(
            documentSnapshot.id,
            'invalid-saved-link-id',
          ),
          ...normalizeLink(documentData),
          createdAt: normalizeCreatedAt(documentData.createdAt),
        }
      })
    } catch (error) {
      if (
        error instanceof SavedLinksServiceError &&
        error.code === 'firestore-request-failed'
      ) {
        throw error
      }

      throw createServiceError('firestore-request-failed', error)
    }
  }

  async function deleteSavedLink({ db, uid, linkId }) {
    const normalizedUid = normalizePathSegment(uid, 'invalid-user-id')
    const normalizedLinkId = normalizePathSegment(
      linkId,
      'invalid-saved-link-id',
    )

    try {
      const documentReference = docImpl(
        db,
        'users',
        normalizedUid,
        'savedLinks',
        normalizedLinkId,
      )
      await deleteDocImpl(documentReference)
    } catch (error) {
      throw createServiceError('firestore-request-failed', error)
    }
  }

  return {
    saveLink,
    listSavedLinks,
    deleteSavedLink,
  }
}

const savedLinksService = createSavedLinksService()

export const saveLink = savedLinksService.saveLink
export const listSavedLinks = savedLinksService.listSavedLinks
export const deleteSavedLink = savedLinksService.deleteSavedLink
