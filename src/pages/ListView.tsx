import { useMemo } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import type { Pokemon } from '../api/pokeapi'
import StatusMessage from '../components/StatusMessage'
import TypeBadge from '../components/TypeBadge'
import { usePokemon } from '../context/PokemonContext'
import type { DetailNavState } from '../types/navigation'
import { formatHeight, formatId, formatName, formatWeight } from '../utils/format'
import styles from './ListView.module.css'

type SortKey = 'id' | 'name' | 'baseExperience' | 'height' | 'weight'
type SortOrder = 'asc' | 'desc'

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'id', label: 'Pokédex number' },
  { key: 'name', label: 'Name' },
  { key: 'baseExperience', label: 'Base experience' },
  { key: 'height', label: 'Height' },
  { key: 'weight', label: 'Weight' },
]

function isSortKey(value: string | null): value is SortKey {
  return SORT_OPTIONS.some((option) => option.key === value)
}

function compare(a: Pokemon, b: Pokemon, key: SortKey): number {
  if (key === 'name') return a.name.localeCompare(b.name)
  return a[key] - b[key]
}

export default function ListView() {
  const { pokemon, loading, error, reload } = usePokemon()
  const location = useLocation()
  // Search/sort live in the URL so they survive navigating to a detail page and back.
  const [params, setParams] = useSearchParams()

  const query = params.get('q') ?? ''
  const sortParam = params.get('sort')
  const sortKey: SortKey = isSortKey(sortParam) ? sortParam : 'id'
  const order: SortOrder = params.get('order') === 'desc' ? 'desc' : 'asc'

  const updateParam = (key: string, value: string) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value) next.set(key, value)
        else next.delete(key)
        return next
      },
      { replace: true },
    )
  }

  const results = useMemo(() => {
    const term = query.trim().toLowerCase()
    const filtered = term
      ? pokemon.filter(
          (p) =>
            p.name.includes(term) ||
            formatName(p.name).toLowerCase().includes(term) ||
            String(p.id) === term.replace(/^#0*/, ''),
        )
      : pokemon
    const direction = order === 'asc' ? 1 : -1
    return [...filtered].sort((a, b) => compare(a, b, sortKey) * direction || a.id - b.id)
  }, [pokemon, query, sortKey, order])

  const navState: DetailNavState = {
    ids: results.map((p) => p.id),
    from: location.pathname + location.search,
  }

  return (
    <section>
      <header className={styles.intro}>
        <h1>Search Pokémon</h1>
        <p>Type to filter the original 151 Pokémon, then sort the results.</p>
      </header>

      <div className={styles.controls}>
        <label className={styles.search}>
          <span className={styles.srOnly}>Search by name or number</span>
          <input
            type="search"
            placeholder="Search by name or number, e.g. pika or 25"
            value={query}
            onChange={(e) => updateParam('q', e.target.value)}
            autoFocus
          />
        </label>

        <label className={styles.field}>
          <span>Sort by</span>
          <select value={sortKey} onChange={(e) => updateParam('sort', e.target.value)}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className={styles.orderToggle} role="group" aria-label="Sort order">
          <button
            type="button"
            aria-pressed={order === 'asc'}
            className={order === 'asc' ? styles.orderActive : ''}
            onClick={() => updateParam('order', '')}
          >
            ↑ Asc
          </button>
          <button
            type="button"
            aria-pressed={order === 'desc'}
            className={order === 'desc' ? styles.orderActive : ''}
            onClick={() => updateParam('order', 'desc')}
          >
            ↓ Desc
          </button>
        </div>
      </div>

      {loading ? (
        <StatusMessage kind="loading" message="Catching Pokémon…" />
      ) : error ? (
        <StatusMessage kind="error" message={error} onRetry={reload} />
      ) : results.length === 0 ? (
        <StatusMessage kind="empty" message={`No Pokémon match “${query}”.`} />
      ) : (
        <>
          <p className={styles.count}>
            {results.length} {results.length === 1 ? 'result' : 'results'}
          </p>
          <ul className={styles.list}>
            {results.map((p) => (
              <li key={p.id}>
                <Link to={`/pokemon/${p.id}`} state={navState} className={styles.row}>
                  <img src={p.sprite} alt="" className={styles.sprite} loading="lazy" />
                  <div className={styles.identity}>
                    <span className={styles.id}>{formatId(p.id)}</span>
                    <span className={styles.name}>{formatName(p.name)}</span>
                  </div>
                  <div className={styles.types}>
                    {p.types.map((t) => (
                      <TypeBadge key={t} type={t} />
                    ))}
                  </div>
                  <dl className={styles.stats}>
                    <div>
                      <dt>Base XP</dt>
                      <dd>{p.baseExperience}</dd>
                    </div>
                    <div>
                      <dt>Height</dt>
                      <dd>{formatHeight(p.height)}</dd>
                    </div>
                    <div>
                      <dt>Weight</dt>
                      <dd>{formatWeight(p.weight)}</dd>
                    </div>
                  </dl>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
