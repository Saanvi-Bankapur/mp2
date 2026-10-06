import { Link, NavLink, Outlet } from 'react-router-dom'
import styles from './Layout.module.css'

function navClass({ isActive }: { isActive: boolean }) {
  return isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
}

export default function Layout() {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to="/" className={styles.brand}>
            <span className={styles.ball} aria-hidden="true" />
            Pokédex
          </Link>
          <nav className={styles.nav} aria-label="Main">
            <NavLink to="/" end className={navClass}>
              List
            </NavLink>
            <NavLink to="/gallery" className={navClass}>
              Gallery
            </NavLink>
          </nav>
        </div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
      <footer className={styles.footer}>
        Data from <a href="https://pokeapi.co/" target="_blank" rel="noreferrer">PokéAPI</a>
      </footer>
    </div>
  )
}
