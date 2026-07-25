import { useState } from 'react'
import { validateUrl } from '../utils/url.js'

function LinkForm({ existingUrls, onSubmitUrl }) {
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionResult, setSubmissionResult] = useState(null)

  const handleInputChange = (event) => {
    setInputValue(event.target.value)
    setError('')
    setSubmissionResult(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isSubmitting) return

    const result = validateUrl(inputValue)

    if (!result.valid) {
      setError(result.reason === 'blank' ? 'Enter a URL.' : 'Enter a valid URL.')
      setSubmissionResult(null)
      return
    }

    if (existingUrls.includes(result.normalized)) {
      setError('This link has already been added.')
      setSubmissionResult(null)
      return
    }

    setError('')
    setSubmissionResult(null)
    setIsSubmitting(true)

    try {
      const submission = await onSubmitUrl(result.normalized)
      setInputValue('')
      setSubmissionResult(submission)
    } catch {
      setError('Something went wrong while adding this link. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      className="link-form"
      onSubmit={handleSubmit}
      noValidate
      aria-busy={isSubmitting}
    >
      <label htmlFor="url-input">Paste or type a URL</label>
      <p id="metadata-notice" className="metadata-notice">
        Metadata retrieval is intended for public URLs. Submitted URLs are processed by an
        external metadata service.
      </p>
      <div className="link-form-row">
        <input
          id="url-input"
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="github.com"
          disabled={isSubmitting}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? 'metadata-notice url-error' : 'metadata-notice'}
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Retrieving metadata…' : 'Add card'}
        </button>
      </div>
      {error && (
        <p id="url-error" className="form-error" role="alert">
          {error}
        </p>
      )}
      {(isSubmitting || submissionResult) && (
        <p
          className={`form-feedback${
            submissionResult ? ` form-feedback-${submissionResult.outcome}` : ''
          }`}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {isSubmitting ? 'Retrieving metadata…' : submissionResult.message}
        </p>
      )}
    </form>
  )
}

export default LinkForm
