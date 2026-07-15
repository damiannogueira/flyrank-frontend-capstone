function Card({ url, domain, onDelete }) {
  return (
    <li className="card">
      <div className="card-info">
        <a href={url} target="_blank" rel="noopener noreferrer">
          {domain}
        </a>
        <p className="card-url">{url}</p>
      </div>
      <button
        type="button"
        className="card-delete"
        onClick={onDelete}
        aria-label={`Delete card for ${domain}`}
      >
        Delete
      </button>
    </li>
  )
}

export default Card
