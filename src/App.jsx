import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import AppHeader from './components/AppHeader.jsx'
import HomePage from './pages/HomePage.jsx'
import SavedLinksPage from './pages/SavedLinksPage.jsx'
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
    <>
      <AppHeader />
      <main id="center">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage cards={cards} onAddCard={addCard} onDeleteCard={deleteCard} />
            }
          />
          <Route path="/saved" element={<SavedLinksPage />} />
        </Routes>
      </main>
    </>
  )
}

export default App
