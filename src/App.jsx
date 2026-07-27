import { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import AppHeader from './components/AppHeader.jsx'
import HomePage from './pages/HomePage.jsx'
import SavedLinksPage from './pages/SavedLinksPage.jsx'
import { ensureAnonymousUser } from './services/authService.js'
import { getFirebaseClient } from './services/firebaseClient.js'
import './App.css'

function App() {
  const [cards, setCards] = useState([])
  const [cardSaveStates, setCardSaveStates] = useState({})
  const [firebaseState, setFirebaseState] = useState({
    status: 'loading',
    db: null,
    uid: null,
  })

  useEffect(() => {
    let isCurrent = true

    const initializeFirebase = async () => {
      try {
        const { auth, db } = await getFirebaseClient()
        const user = await ensureAnonymousUser({ auth })

        if (isCurrent) {
          setFirebaseState({
            status: 'authenticated',
            db,
            uid: user.uid,
          })
        }
      } catch (error) {
        if (!isCurrent) return

        const isConfigurationError = [
          'firebase-configuration-error',
          'firebase-initialization-error',
        ].includes(error?.code)

        setFirebaseState({
          status: isConfigurationError
            ? 'configuration-error'
            : 'authentication-error',
          db: null,
          uid: null,
        })
      }
    }

    initializeFirebase()

    return () => {
      isCurrent = false
    }
  }, [])

  const addCard = (cardData) => {
    const newCard = {
      id: crypto.randomUUID(),
      ...cardData,
    }
    setCards((prevCards) => [...prevCards, newCard])
  }

  const deleteCard = (id) => {
    setCards((prevCards) => prevCards.filter((card) => card.id !== id))
    setCardSaveStates((previousStates) => {
      const nextStates = { ...previousStates }
      delete nextStates[id]
      return nextStates
    })
  }

  const updateCardSaveState = (id, saveState) => {
    setCardSaveStates((previousStates) => ({
      ...previousStates,
      [id]: saveState,
    }))
  }

  const clearCardSaveStatesByUrl = (url) => {
    const matchingCardIds = new Set(
      cards.filter((card) => card.url === url).map((card) => card.id),
    )

    setCardSaveStates((previousStates) =>
      Object.fromEntries(
        Object.entries(previousStates).filter(
          ([cardId]) => !matchingCardIds.has(cardId),
        ),
      ),
    )
  }

  return (
    <>
      <AppHeader />
      <main id="center">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                cards={cards}
                cardSaveStates={cardSaveStates}
                firebaseState={firebaseState}
                onAddCard={addCard}
                onDeleteCard={deleteCard}
                onUpdateCardSaveState={updateCardSaveState}
              />
            }
          />
          <Route
            path="/saved"
            element={
              <SavedLinksPage
                firebaseState={firebaseState}
                onClearCardSaveStatesByUrl={clearCardSaveStatesByUrl}
              />
            }
          />
        </Routes>
      </main>
    </>
  )
}

export default App
