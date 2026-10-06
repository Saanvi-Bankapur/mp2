import axios from 'axios'

const api = axios.create({
  baseURL: 'https://pokeapi.co/api/v2',
  timeout: 15000,
})

/** We work with the original 151 Pokémon (Generation I). */
export const POKEMON_COUNT = 151

const CACHE_KEY = 'mp2-pokemon-cache-v1'

// ---- Raw shapes returned by PokéAPI (only the fields we use) ----

interface NamedResource {
  name: string
  url: string
}

interface RawPokemon {
  id: number
  name: string
  height: number
  weight: number
  base_experience: number | null
  types: { slot: number; type: NamedResource }[]
  abilities: { ability: NamedResource; is_hidden: boolean }[]
  stats: { base_stat: number; stat: NamedResource }[]
  sprites: {
    front_default: string | null
    other?: {
      'official-artwork'?: { front_default: string | null }
    }
  }
}

interface RawSpecies {
  flavor_text_entries: { flavor_text: string; language: NamedResource }[]
  genera: { genus: string; language: NamedResource }[]
}

// ---- App-level shapes ----

export interface Stat {
  name: string
  value: number
}

export interface Ability {
  name: string
  hidden: boolean
}

export interface Pokemon {
  id: number
  name: string
  /** Height in decimetres (PokéAPI unit). */
  height: number
  /** Weight in hectograms (PokéAPI unit). */
  weight: number
  baseExperience: number
  types: string[]
  abilities: Ability[]
  stats: Stat[]
  sprite: string
  artwork: string
}

export interface SpeciesInfo {
  genus: string
  description: string
}

function toPokemon(raw: RawPokemon): Pokemon {
  const sprite = raw.sprites.front_default ?? ''
  return {
    id: raw.id,
    name: raw.name,
    height: raw.height,
    weight: raw.weight,
    baseExperience: raw.base_experience ?? 0,
    types: [...raw.types].sort((a, b) => a.slot - b.slot).map((t) => t.type.name),
    abilities: raw.abilities.map((a) => ({ name: a.ability.name, hidden: a.is_hidden })),
    stats: raw.stats.map((s) => ({ name: s.stat.name, value: s.base_stat })),
    sprite,
    artwork: raw.sprites.other?.['official-artwork']?.front_default ?? sprite,
  }
}

function readCache(): Pokemon[] | null {
  try {
    const stored = localStorage.getItem(CACHE_KEY)
    if (!stored) return null
    const parsed = JSON.parse(stored) as Pokemon[]
    return Array.isArray(parsed) && parsed.length === POKEMON_COUNT ? parsed : null
  } catch {
    return null
  }
}

function writeCache(pokemon: Pokemon[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(pokemon))
  } catch {
    // Storage full or unavailable — caching is only an optimisation.
  }
}

export async function fetchPokemon(idOrName: number | string): Promise<Pokemon> {
  const { data } = await api.get<RawPokemon>(`/pokemon/${idOrName}`)
  return toPokemon(data)
}

/**
 * Loads every Pokémon we display. Results are cached in localStorage so
 * repeat visits don't make 151 requests (PokéAPI asks clients to cache).
 */
export async function fetchAllPokemon(): Promise<Pokemon[]> {
  const cached = readCache()
  if (cached) return cached

  const ids = Array.from({ length: POKEMON_COUNT }, (_, i) => i + 1)
  const pokemon = await Promise.all(ids.map((id) => fetchPokemon(id)))
  writeCache(pokemon)
  return pokemon
}

export async function fetchSpecies(id: number): Promise<SpeciesInfo> {
  const { data } = await api.get<RawSpecies>(`/pokemon-species/${id}`)
  const genus = data.genera.find((g) => g.language.name === 'en')?.genus ?? ''
  const flavor = data.flavor_text_entries.find((f) => f.language.name === 'en')?.flavor_text ?? ''
  // Flavor text contains form-feeds and hard line breaks from the games.
  const description = flavor.replace(/[\f\n\r­]+/g, ' ').replace(/\s+/g, ' ').trim()
  return { genus, description }
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 404) return 'That Pokémon could not be found.'
    if (error.response?.status === 429) return 'Too many requests — please wait a moment and try again.'
    if (error.code === 'ECONNABORTED') return 'The request timed out. Check your connection and try again.'
    return error.message
  }
  return 'Something went wrong.'
}
