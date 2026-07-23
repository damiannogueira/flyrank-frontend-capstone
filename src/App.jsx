import { useState } from 'react'
import LinkForm from './components/LinkForm.jsx'
import CardList from './components/CardList.jsx'
import { getDomain } from './utils/url.js'
import './App.css'

function App() {
  const [cards, setCards] = useState([])

  const addCard = (normalizedUrl) => {
    const newCard = {
      id: crypto.randomUUID(),
      url: normalizedUrl,
      domain: getDomain(normalizedUrl),
    }
    setCards((prevCards) => [...prevCards, newCard])
  }

  const deleteCard = (id) => {
    setCards((prevCards) => prevCards.filter((card) => card.id !== id))
  }

  return (
    <main id="center">
      <h1>ContextClip</h1>
      <p className="intro">Turn research links into visual cards.</p>

      <LinkForm existingUrls={cards.map((card) => card.url)} onAddCard={addCard} />

      <CardList cards={cards} onDeleteCard={deleteCard} />
    </main>
  )
}

export default App
