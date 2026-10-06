import { useMemo } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import StatusMessage from '../components/StatusMessage'
import typeStyles from '../components/TypeBadge.module.css'
import { usePokemon } from '../context/PokemonContext'
import type { DetailNavState } from '../types/navigation'
import { formatId, formatName } from '../utils/format'
import styles from './GalleryView.module.css'

export default function GalleryView() {
  const { pokemon, loading, error, reload } = usePokemon()
  const location = useLocation()
  // Selected types are stored as ?types=fire,water so the filter survives back navigation.
  const [params, setParams] = useSearchParams()

  const selected = useMemo(
    () => (params.get('types') ?? '').split(',').filter(Boolean),
    [params],
  )

  const allTypes = useMemo(
    () => [...new Set(pokemon.flatMap((p) => p.types))].sort(),
    [pokemon],
  )

  // A Pokémon is shown if it has ANY of the selected types.
  const results = useMemo(
    () =>
      selected.length === 0
        ? pokemon
        : pokemon.filter((p) => p.types.some((t) => selected.includes(t))),
    [pokemon, selected],
  )

  const setSelected = (types: string[]) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (types.length) next.set('types', types.join(','))
        else next.delete('types')
        return next
      },
      { replace: true },
    )
  }

  const toggleType = (type: string) => {
    setSelected(selected.includes(type) ? selected.filter((t) => t !== type) : [...selected, type])
  }

  const navState: DetailNavState = {
    ids: results.map((p) => p.id),
    from: location.pathname + location.search,
  }

  return (
    <section>
      <header className={styles.intro}>
        <h1>Gallery</h1>
        <p>Pick one or more types to filter the gallery. Click a Pokémon to see its details.</p>
      </header>

      {!loading && !error && (
        <div className={styles.filters} role="group" aria-label="Filter by type">
          {allTypes.map((type) => {
            const active = selected.includes(type)
            return (
              <button
                key={type}
                type="button"
                aria-pressed={active}
                className={`${styles.chip} ${active ? `${styles.chipActive} ${typeStyles[type] ?? ''}` : ''}`}
                onClick={() => toggleType(type)}
              >
                {type}
              </button>
            )
          })}
          {selected.length > 0 && (
            <button type="button" className={styles.clear} onClick={() => setSelected([])}>
              Clear filters
            </button>
          )}
        </div>
      )}

      {loading ? (
        <StatusMessage kind="loading" message="Catching Pokémon…" />
      ) : error ? (
        <StatusMessage kind="error" message={error} onRetry={reload} />
      ) : results.length === 0 ? (
        <StatusMessage kind="empty" message="No Pokémon match the selected types." />
      ) : (
        <>
          <p className={styles.count}>
            Showing {results.length} of {pokemon.length}
          </p>
          <ul className={styles.grid}>
            {results.map((p) => (
              <li key={p.id}>
                <Link to={`/pokemon/${p.id}`} state={navState} className={styles.card}>
                  <div className={`${styles.imageWrap} ${typeStyles[p.types[0]] ?? ''}`}>
                    <img src={p.artwork} alt={formatName(p.name)} loading="lazy" />
                  </div>
                  <div className={styles.caption}>
                    <span className={styles.id}>{formatId(p.id)}</span>
                    <span className={styles.name}>{formatName(p.name)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
