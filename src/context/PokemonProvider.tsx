import { useEffect, useState, type ReactNode } from 'react'
import { fetchAllPokemon, getErrorMessage, type Pokemon } from '../api/pokeapi'
import { PokemonContext } from './PokemonContext'

/** Fetches the Pokémon list once and shares it with every view. */
export default function PokemonProvider({ children }: { children: ReactNode }) {
  const [pokemon, setPokemon] = useState<Pokemon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    fetchAllPokemon()
      .then((data) => {
        if (cancelled) return
        setPokemon(data)
        setError(null)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(getErrorMessage(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [attempt])

  const reload = () => {
    setLoading(true)
    setError(null)
    setAttempt((n) => n + 1)
  }

  return (
    <PokemonContext.Provider value={{ pokemon, loading, error, reload }}>
      {children}
    </PokemonContext.Provider>
  )
}
