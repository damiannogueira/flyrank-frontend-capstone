import { useState } from 'react'
import { validateUrl } from '../utils/url.js'

function LinkForm({ existingUrls, onAddCard }) {
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()

    const result = validateUrl(inputValue)

    if (!result.valid) {
      setError(result.reason === 'blank' ? 'Enter a URL.' : 'Enter a valid URL.')
      return
    }

    if (existingUrls.includes(result.normalized)) {
      setError('This link has already been added.')
      return
    }

    onAddCard(result.normalized)
    setInputValue('')
    setError('')
  }

  return (
    <form className="link-form" onSubmit={handleSubmit} noValidate>
      <label htmlFor="url-input">Paste or type a URL</label>
      <div className="link-form-row">
        <input
          id="url-input"
          type="text"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          placeholder="github.com"
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? 'url-error' : undefined}
        />
        <button type="submit">Add card</button>
      </div>
      {error && (
        <p id="url-error" className="form-error" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}

export default LinkForm
