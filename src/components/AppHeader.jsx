import { NavLink } from 'react-router-dom'

function AppHeader() {
  return (
    <header className="app-header">
      <span className="app-brand">ContextClip</span>
      <nav aria-label="Primary navigation">
        <ul className="nav-list">
          <li>
            <NavLink to="/" end>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/saved">Saved Links</NavLink>
          </li>
        </ul>
      </nav>
    </header>
  )
}

export default AppHeader
