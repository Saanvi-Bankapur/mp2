/** "mr-mime" -> "Mr Mime", "nidoran-f" -> "Nidoran F" */
export function formatName(name: string): string {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

/** 7 -> "#007" */
export function formatId(id: number): string {
  return `#${String(id).padStart(3, '0')}`
}

/** PokéAPI height is in decimetres. */
export function formatHeight(decimetres: number): string {
  return `${(decimetres / 10).toFixed(1)} m`
}

/** PokéAPI weight is in hectograms. */
export function formatWeight(hectograms: number): string {
  return `${(hectograms / 10).toFixed(1)} kg`
}

const STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  'special-attack': 'Sp. Atk',
  'special-defense': 'Sp. Def',
  speed: 'Speed',
}

export function formatStat(name: string): string {
  return STAT_LABELS[name] ?? formatName(name)
}
