import { useState } from 'react'

function Card({ url, domain, title, description, imageUrl, faviconUrl, onDelete }) {
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
        <button
          type="button"
          className="card-delete"
          onClick={onDelete}
          aria-label={`Delete card for ${displayTitle}`}
        >
          Delete
        </button>
      </div>
    </li>
  )
}

export default Card
