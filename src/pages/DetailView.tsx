import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { fetchPokemon, fetchSpecies, getErrorMessage, type Pokemon, type SpeciesInfo } from '../api/pokeapi'
import StatusMessage from '../components/StatusMessage'
import TypeBadge from '../components/TypeBadge'
import typeStyles from '../components/TypeBadge.module.css'
import { usePokemon } from '../context/PokemonContext'
import { isDetailNavState, type DetailNavState } from '../types/navigation'
import { formatHeight, formatId, formatName, formatStat, formatWeight } from '../utils/format'
import styles from './DetailView.module.css'

const MAX_BASE_STAT = 255

/** Results are tagged with the id they belong to so stale responses are ignored. */
interface Tagged<T> {
  id: number
  value: T
}

export default function DetailView() {
  const { id: idParam } = useParams()
  const id = Number(idParam)
  const validId = Number.isInteger(id) && id > 0

  const location = useLocation()
  const navigate = useNavigate()
  const { pokemon: allPokemon, loading: listLoading } = usePokemon()

  // Came from the list/gallery: cycle through those results. Direct URL: cycle through everything.
  const navState: DetailNavState = useMemo(
    () =>
      isDetailNavState(location.state)
        ? location.state
        : { ids: allPokemon.map((p) => p.id), from: '/' },
    [location.state, allPokemon],
  )

  const fromList = allPokemon.find((p) => p.id === id)
  const [fetched, setFetched] = useState<Tagged<Pokemon> | null>(null)
  const [fetchError, setFetchError] = useState<Tagged<string> | null>(null)
  const [species, setSpecies] = useState<Tagged<SpeciesInfo> | null>(null)

  // Pokémon outside the cached list (e.g. /pokemon/400 typed into the URL) are fetched directly.
  const needsFetch = validId && !listLoading && !fromList
  useEffect(() => {
    if (!needsFetch) return
    let cancelled = false
    fetchPokemon(id)
      .then((value) => !cancelled && setFetched({ id, value }))
      .catch((err: unknown) => !cancelled && setFetchError({ id, value: getErrorMessage(err) }))
    return () => {
      cancelled = true
    }
  }, [id, needsFetch])

  useEffect(() => {
    if (!validId) return
    let cancelled = false
    fetchSpecies(id)
      .then((value) => !cancelled && setSpecies({ id, value }))
      .catch(() => {
        // The description is optional; the page still works without it.
      })
    return () => {
      cancelled = true
    }
  }, [id, validId])

  const detail = fromList ?? (fetched?.id === id ? fetched.value : null)
  const error = !validId
    ? 'That is not a valid Pokémon number.'
    : fetchError?.id === id
      ? fetchError.value
      : null
  const speciesInfo = species?.id === id ? species.value : null

  // Previous / next wrap around the list. If this id isn't in the list, step by number instead.
  const { ids } = navState
  const index = ids.indexOf(id)
  const prevId = index >= 0 ? ids[(index - 1 + ids.length) % ids.length] : id > 1 ? id - 1 : null
  const nextId = index >= 0 ? ids[(index + 1) % ids.length] : validId ? id + 1 : null

  // Arrow keys also move between Pokémon.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return
      if (e.key === 'ArrowLeft' && prevId !== null) navigate(`/pokemon/${prevId}`, { state: navState })
      if (e.key === 'ArrowRight' && nextId !== null) navigate(`/pokemon/${nextId}`, { state: navState })
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [navigate, navState, prevId, nextId])

  const pager = (
    <nav className={styles.pager} aria-label="Browse Pokémon">
      {prevId !== null ? (
        <Link to={`/pokemon/${prevId}`} state={navState} className={styles.pagerButton}>
          ← Previous
        </Link>
      ) : (
        <span className={`${styles.pagerButton} ${styles.disabled}`}>← Previous</span>
      )}
      {index >= 0 && (
        <span className={styles.position}>
          {index + 1} of {ids.length}
        </span>
      )}
      {nextId !== null ? (
        <Link to={`/pokemon/${nextId}`} state={navState} className={styles.pagerButton}>
          Next →
        </Link>
      ) : (
        <span className={`${styles.pagerButton} ${styles.disabled}`}>Next →</span>
      )}
    </nav>
  )

  const back = (
    <Link to={navState.from} className={styles.back}>
      ← Back to results
    </Link>
  )

  if (error) {
    return (
      <section>
        {back}
        <StatusMessage kind="error" message={error} />
        {validId && pager}
      </section>
    )
  }

  if (!detail) {
    return (
      <section>
        {back}
        <StatusMessage kind="loading" message="Loading Pokémon…" />
      </section>
    )
  }

  const totalStats = detail.stats.reduce((sum, s) => sum + s.value, 0)

  return (
    <section>
      <div className={styles.topBar}>
        {back}
        {pager}
      </div>

      <article className={styles.card}>
        <div className={`${styles.hero} ${typeStyles[detail.types[0]] ?? ''}`}>
          <img src={detail.artwork} alt={formatName(detail.name)} className={styles.artwork} />
        </div>

        <div className={styles.body}>
          <header className={styles.heading}>
            <span className={styles.id}>{formatId(detail.id)}</span>
            <h1>{formatName(detail.name)}</h1>
            {speciesInfo?.genus && <p className={styles.genus}>{speciesInfo.genus}</p>}
            <div className={styles.types}>
              {detail.types.map((t) => (
                <TypeBadge key={t} type={t} />
              ))}
            </div>
          </header>

          {speciesInfo?.description && <p className={styles.description}>{speciesInfo.description}</p>}

          <dl className={styles.facts}>
            <div>
              <dt>Height</dt>
              <dd>{formatHeight(detail.height)}</dd>
            </div>
            <div>
              <dt>Weight</dt>
              <dd>{formatWeight(detail.weight)}</dd>
            </div>
            <div>
              <dt>Base XP</dt>
              <dd>{detail.baseExperience}</dd>
            </div>
            <div>
              <dt>Abilities</dt>
              <dd>
                {detail.abilities.map((a) => (
                  <span key={a.name} className={styles.ability}>
                    {formatName(a.name)}
                    {a.hidden && <small> (hidden)</small>}
                  </span>
                ))}
              </dd>
            </div>
          </dl>

          <h2 className={styles.statsTitle}>Base stats</h2>
          <dl className={styles.stats}>
            {detail.stats.map((s) => (
              <div key={s.name} className={styles.statRow}>
                <dt>{formatStat(s.name)}</dt>
                <dd>
                  <span className={styles.statValue}>{s.value}</span>
                  <progress value={s.value} max={MAX_BASE_STAT} className={styles.statBar}>
                    {s.value}
                  </progress>
                </dd>
              </div>
            ))}
            <div className={`${styles.statRow} ${styles.total}`}>
              <dt>Total</dt>
              <dd>
                <span className={styles.statValue}>{totalStats}</span>
              </dd>
            </div>
          </dl>
        </div>
      </article>
    </section>
  )
}
