import type { PokemonSummary, PokemonListResponse } from '../../helpers/load'

const BASE_URL = 'https://pokeapi.co/api/v2/pokemon/'

export const INITIAL_URL = BASE_URL
export const RESET_URL = `${BASE_URL}?offset=0&limit=20`
export const SEARCH_URL = `${BASE_URL}?offset=0&limit=100000`
export const NEXT_URL = `${BASE_URL}?offset=20&limit=20`

export function buildPokemon(name: string, id: number): PokemonSummary {
    return { name, url: `${BASE_URL}${id}/` }
}

export function buildPage({ results = [], next = null, previous = null }: {
    results?: PokemonSummary[]
    next?: string | null
    previous?: string | null
} = {}): PokemonListResponse {
    return { count: results.length, next, previous, results }
}

export const bulbasaur = buildPokemon('bulbasaur', 1)
export const charmander = buildPokemon('charmander', 4)
export const pikachu = buildPokemon('pikachu', 25)
export const eevee = buildPokemon('eevee', 133)

export function firstPage() {
    return buildPage({ results: [bulbasaur, charmander, pikachu], next: NEXT_URL })
}

export function lastPage() {
    return buildPage({ results: [eevee], previous: RESET_URL })
}

export function fullPage() {
    return buildPage({ results: [bulbasaur, charmander, pikachu, eevee] })
}

export function emptyPage() {
    return buildPage({ results: [] })
}
