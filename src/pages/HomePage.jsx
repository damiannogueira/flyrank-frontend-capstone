import LinkForm from '../components/LinkForm.jsx'
import CardList from '../components/CardList.jsx'
import { fetchLinkMetadata } from '../services/metadataService.js'
import { getDomain } from '../utils/url.js'

function HomePage({ cards, onAddCard, onDeleteCard }) {
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

  return (
    <>
      <h1>Organize your research links</h1>
      <p className="intro">Turn research links into visual cards.</p>

      <LinkForm
        existingUrls={cards.map((card) => card.url)}
        onSubmitUrl={handleSubmitUrl}
      />

      <CardList cards={cards} onDeleteCard={onDeleteCard} />
    </>
  )
}

export default HomePage
