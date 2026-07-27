import { useRef } from 'react'
import LinkForm from '../components/LinkForm.jsx'
import CardList from '../components/CardList.jsx'
import { fetchLinkMetadata } from '../services/metadataService.js'
import { saveLink } from '../services/savedLinksService.js'
import { getDomain } from '../utils/url.js'

const FIREBASE_STATUS_MESSAGES = {
  loading: 'Saved Links is connecting. Save actions will be available shortly.',
  'configuration-error':
    'Saved Links is unavailable because Firebase is not configured correctly. You can still create and delete links on this page.',
  'authentication-error':
    'Saved Links is unavailable because anonymous authentication failed. You can still create and delete links on this page.',
}

function getAccessibleCardName(card) {
  return card.title ? `${card.title} on ${card.domain}` : card.domain
}

function HomePage({
  cards,
  cardSaveStates,
  firebaseState,
  onAddCard,
  onDeleteCard,
  onUpdateCardSaveState,
}) {
  const pendingSaveIds = useRef(new Set())

  const handleSubmitUrl = async (normalizedUrl) => {
    const domain = getDomain(normalizedUrl)
    const fallbackCard = {
      url: normalizedUrl,
      domain,
      title: null,
      description: null,
      imageUrl: null,
      faviconUrl: null,
    }

    try {
      const metadata = await fetchLinkMetadata(normalizedUrl)
      const cardData = {
        url: normalizedUrl,
        domain,
        ...metadata,
      }
      const isComplete = Object.values(metadata).every(Boolean)

      onAddCard(cardData)

      return isComplete
        ? {
            outcome: 'complete',
            message: 'Link added with complete metadata.',
          }
        : {
            outcome: 'partial',
            message: 'Link added with the metadata that was available.',
          }
    } catch (error) {
      const expectedErrorCodes = [
        'rate-limit',
        'timeout',
        'request-failed',
        'invalid-response',
      ]

      if (!expectedErrorCodes.includes(error?.code)) {
        throw error
      }

      onAddCard(fallbackCard)

      if (error.code === 'rate-limit') {
        return {
          outcome: 'rate-limit',
          message: 'The metadata service limit was reached. The link was added without metadata.',
        }
      }

      if (error.code === 'timeout') {
        return {
          outcome: 'fallback',
          message: 'Metadata retrieval took too long. The link was added without metadata.',
        }
      }

      return {
        outcome: 'fallback',
        message: 'Metadata was unavailable. The link was added without metadata.',
      }
    }
  }

  const handleSaveCard = async (card) => {
    const existingState = cardSaveStates[card.id]?.status

    if (
      firebaseState.status !== 'authenticated' ||
      pendingSaveIds.current.has(card.id) ||
      existingState === 'saved' ||
      existingState === 'duplicate'
    ) {
      return
    }

    pendingSaveIds.current.add(card.id)
    onUpdateCardSaveState(card.id, {
      status: 'saving',
      message: `Saving ${card.title || card.domain}.`,
    })

    try {
      await saveLink({
        db: firebaseState.db,
        uid: firebaseState.uid,
        link: card,
      })
      onUpdateCardSaveState(card.id, {
        status: 'saved',
        message: `${card.title || card.domain} was saved successfully.`,
      })
    } catch (error) {
      if (error?.code === 'duplicate-saved-link') {
        onUpdateCardSaveState(card.id, {
          status: 'duplicate',
          message: `${card.title || card.domain} is already in Saved Links.`,
        })
      } else {
        onUpdateCardSaveState(card.id, {
          status: 'error',
          message: `${card.title || card.domain} could not be saved. Try again when you are ready.`,
        })
      }
    } finally {
      pendingSaveIds.current.delete(card.id)
    }
  }

  const getCardActions = (card) => {
    const saveState = cardSaveStates[card.id] ?? { status: 'ready' }
    const accessibleCardName = getAccessibleCardName(card)
    const saveLabels = {
      ready: 'Save',
      saving: 'Saving…',
      saved: 'Saved',
      duplicate: 'Already saved',
      error: 'Retry save',
    }

    const actions = []

    if (firebaseState.status === 'authenticated') {
      actions.push({
        key: 'save',
        label: saveLabels[saveState.status],
        accessibleLabel: `${saveLabels[saveState.status]} ${accessibleCardName}`,
        onClick: () => handleSaveCard(card),
        disabled: ['saving', 'saved', 'duplicate'].includes(saveState.status),
        isPending: saveState.status === 'saving',
        variant: 'primary',
      })
    }

    actions.push({
      key: 'delete',
      label: 'Delete',
      accessibleLabel: `Delete card for ${accessibleCardName}`,
      onClick: () => onDeleteCard(card.id),
      variant: 'secondary',
    })

    return {
      actions,
      actionFeedback: saveState.message ?? null,
    }
  }

  const firebaseMessage = FIREBASE_STATUS_MESSAGES[firebaseState.status]
  const hasFirebaseError = [
    'configuration-error',
    'authentication-error',
  ].includes(firebaseState.status)

  return (
    <>
      <h1>Organize your research links</h1>
      <p className="intro">Turn research links into visual cards.</p>

      <LinkForm
        existingUrls={cards.map((card) => card.url)}
        onSubmitUrl={handleSubmitUrl}
      />

      {firebaseMessage && (
        <p
          className={`firebase-status${hasFirebaseError ? ' firebase-status-error' : ''}`}
          role={hasFirebaseError ? 'alert' : 'status'}
        >
          {firebaseMessage}
        </p>
      )}

      <CardList cards={cards} getCardActions={getCardActions} />
    </>
  )
}

export default HomePage
