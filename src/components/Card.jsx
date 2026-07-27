import { useState } from 'react'

function Card({
  url,
  domain,
  title,
  description,
  imageUrl,
  faviconUrl,
  actions = [],
  actionFeedback,
}) {
  const [showImage, setShowImage] = useState(Boolean(imageUrl))
  const [showFavicon, setShowFavicon] = useState(Boolean(faviconUrl))
  const displayTitle = title || domain

  return (
    <li className="card">
      {showImage && (
        <img
          className="card-preview"
          src={imageUrl}
          alt=""
          onError={() => setShowImage(false)}
        />
      )}
      <div className="card-content">
        <div className="card-info">
          <div className="card-site">
            {showFavicon && (
              <img
                className="card-favicon"
                src={faviconUrl}
                alt=""
                onError={() => setShowFavicon(false)}
              />
            )}
            <span>{domain}</span>
          </div>
          <a
            className="card-title"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {displayTitle}
          </a>
          {description && <p className="card-description">{description}</p>}
          <p className="card-url">{url}</p>
        </div>
        {actions.length > 0 && (
          <div className="card-actions">
            {actions.map((action) => (
              <button
                key={action.key}
                ref={action.buttonRef}
                type="button"
                className={`card-action card-action-${action.variant ?? 'secondary'}`}
                onClick={action.onClick}
                aria-label={action.accessibleLabel}
                aria-busy={action.isPending || undefined}
                disabled={action.disabled}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {actionFeedback && (
        <p className="card-action-feedback" role="status">
          {actionFeedback}
        </p>
      )}
    </li>
  )
}

export default Card
