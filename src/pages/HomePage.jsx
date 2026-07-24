import LinkForm from '../components/LinkForm.jsx'
import CardList from '../components/CardList.jsx'

function HomePage({ cards, onAddCard, onDeleteCard }) {
  return (
    <>
      <h1>Organize your research links</h1>
      <p className="intro">Turn research links into visual cards.</p>

      <LinkForm existingUrls={cards.map((card) => card.url)} onAddCard={onAddCard} />

      <CardList cards={cards} onDeleteCard={onDeleteCard} />
    </>
  )
}

export default HomePage
