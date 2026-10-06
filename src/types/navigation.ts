/**
 * Router state passed to the detail view so PREVIOUS / NEXT cycle through
 * the same (filtered, sorted) list the user clicked from.
 */
export interface DetailNavState {
  ids: number[]
  /** Path + query string of the view to go back to. */
  from: string
}

export function isDetailNavState(value: unknown): value is DetailNavState {
  if (typeof value !== 'object' || value === null) return false
  const state = value as Partial<DetailNavState>
  return Array.isArray(state.ids) && typeof state.from === 'string'
}
