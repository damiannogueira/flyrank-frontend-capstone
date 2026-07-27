import Card from './Card.jsx'

function CardList({
  cards,
  emptyMessage = 'No links yet. Add a URL above to create your first card.',
  getCardActions = () => ({}),
}) {
  if (cards.length === 0) {
    return <p className="empty-state">{emptyMessage}</p>
  }

  return (
    <ul className="card-list">
      {cards.map((card) => {
        const cardActions = getCardActions(card)

        return (
          <Card
            key={card.id}
            url={card.url}
            domain={card.domain}
            title={card.title}
            description={card.description}
            imageUrl={card.imageUrl}
            faviconUrl={card.faviconUrl}
            {...cardActions}
          />
        )
      })}
    </ul>
  )
}

export default CardList
