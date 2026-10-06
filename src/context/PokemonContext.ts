import { createContext, useContext } from 'react'
import type { Pokemon } from '../api/pokeapi'

export interface PokemonContextValue {
  pokemon: Pokemon[]
  loading: boolean
  error: string | null
  reload: () => void
}

export const PokemonContext = createContext<PokemonContextValue | null>(null)

export function usePokemon(): PokemonContextValue {
  const value = useContext(PokemonContext)
  if (!value) throw new Error('usePokemon must be used inside <PokemonProvider>')
  return value
}
