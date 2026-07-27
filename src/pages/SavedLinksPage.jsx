import { useEffect, useRef, useState } from 'react'
import CardList from '../components/CardList.jsx'
import {
  deleteSavedLink,
  listSavedLinks,
} from '../services/savedLinksService.js'

const BLOCKING_MESSAGES = {
  'configuration-error':
    'Saved Links cannot load because Firebase is not configured correctly.',
  'authentication-error':
    'Saved Links cannot load because anonymous authentication failed.',
}

function getAccessibleCardName(link) {
  return link.title ? `${link.title} on ${link.domain}` : link.domain
}

function SavedLinksPage({ firebaseState, onClearCardSaveStatesByUrl }) {
  const [links, setLinks] = useState([])
  const [listStatus, setListStatus] = useState('loading')
  const [actionFeedback, setActionFeedback] = useState('')
  const [deletingIds, setDeletingIds] = useState(new Set())
  const deletingIdsRef = useRef(new Set())
  const deleteButtonRefs = useRef(new Map())
  const headingRef = useRef(null)
  const pendingFocusTarget = useRef(null)

  useEffect(() => {
    if (firebaseState.status !== 'authenticated') return

    let isCurrent = true

    listSavedLinks({
      db: firebaseState.db,
      uid: firebaseState.uid,
    })
      .then((savedLinks) => {
        if (!isCurrent) return
        setLinks(savedLinks)
        setListStatus('ready')
      })
      .catch(() => {
        if (!isCurrent) return
        setListStatus('error')
      })

    return () => {
      isCurrent = false
    }
  }, [firebaseState.db, firebaseState.status, firebaseState.uid])

  useEffect(() => {
    const focusTarget = pendingFocusTarget.current

    if (focusTarget === null) return

    if (focusTarget === 'heading') {
      headingRef.current?.focus()
    } else {
      deleteButtonRefs.current.get(focusTarget)?.focus()
    }

    pendingFocusTarget.current = null
  }, [links])

  const handleDelete = async (link) => {
    if (deletingIdsRef.current.has(link.id)) return

    deletingIdsRef.current.add(link.id)
    setDeletingIds((currentIds) => new Set(currentIds).add(link.id))
    setActionFeedback(`Deleting ${link.title || link.domain}.`)

    try {
      await deleteSavedLink({
        db: firebaseState.db,
        uid: firebaseState.uid,
        linkId: link.id,
      })
      onClearCardSaveStatesByUrl(link.url)

      setLinks((currentLinks) => {
        const deletedIndex = currentLinks.findIndex(
          (item) => item.id === link.id,
        )
        const remainingLinks = currentLinks.filter(
          (item) => item.id !== link.id,
        )

        pendingFocusTarget.current =
          remainingLinks[deletedIndex]?.id ??
          remainingLinks[deletedIndex - 1]?.id ??
          'heading'

        return remainingLinks
      })
      setActionFeedback(
        `${link.title || link.domain} was deleted from Saved Links.`,
      )
    } catch {
      setActionFeedback(
        `${link.title || link.domain} could not be deleted. Try again when you are ready.`,
      )
    } finally {
      deletingIdsRef.current.delete(link.id)
      setDeletingIds((currentIds) => {
        const nextIds = new Set(currentIds)
        nextIds.delete(link.id)
        return nextIds
      })
    }
  }

  const getCardActions = (link) => {
    const isDeleting = deletingIds.has(link.id)
    const accessibleCardName = getAccessibleCardName(link)

    return {
      actions: [
        {
          key: 'delete',
          label: isDeleting ? 'Deleting…' : 'Delete',
          accessibleLabel: `${isDeleting ? 'Deleting' : 'Delete'} ${accessibleCardName} from Saved Links`,
          onClick: () => handleDelete(link),
          disabled: isDeleting,
          isPending: isDeleting,
          variant: 'secondary',
          buttonRef: (element) => {
            if (element) {
              deleteButtonRefs.current.set(link.id, element)
            } else {
              deleteButtonRefs.current.delete(link.id)
            }
          },
        },
      ],
    }
  }

  const blockingMessage = BLOCKING_MESSAGES[firebaseState.status]
  const isWaiting = firebaseState.status === 'loading'

  return (
    <>
      <h1 ref={headingRef} tabIndex="-1">
        Saved Links
      </h1>

      {isWaiting && (
        <p className="firebase-status" role="status" aria-live="polite">
          Connecting to Saved Links…
        </p>
      )}

      {blockingMessage && (
        <p className="firebase-status firebase-status-error" role="alert">
          {blockingMessage}
        </p>
      )}

      {firebaseState.status === 'authenticated' &&
        listStatus === 'loading' && (
          <p className="saved-links-state" role="status" aria-live="polite">
            Loading saved links…
          </p>
        )}

      {firebaseState.status === 'authenticated' && listStatus === 'error' && (
        <p className="firebase-status firebase-status-error" role="alert">
          Saved Links could not be loaded. Your transient Home links are still
          available.
        </p>
      )}

      {firebaseState.status === 'authenticated' && listStatus === 'ready' && (
        <CardList
          cards={links}
          emptyMessage="No saved links yet. Save a link from Home to add it here."
          getCardActions={getCardActions}
        />
      )}

      {actionFeedback && (
        <p className="card-action-feedback saved-action-feedback" role="status">
          {actionFeedback}
        </p>
      )}
    </>
  )
}

export default SavedLinksPage
