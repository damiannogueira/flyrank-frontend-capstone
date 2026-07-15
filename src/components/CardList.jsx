import Card from './Card.jsx'

function CardList({ cards, onDeleteCard }) {
  if (cards.length === 0) {
    return <p className="empty-state">No links yet. Add a URL above to create your first card.</p>
  }

  return (
    <ul className="card-list">
      {cards.map((card) => (
        <Card
          key={card.id}
          url={card.url}
          domain={card.domain}
          onDelete={() => onDeleteCard(card.id)}
        />
      ))}
    </ul>
  )
}

export default CardList
