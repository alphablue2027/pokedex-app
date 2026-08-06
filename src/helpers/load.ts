import axios from "axios"

export interface PokemonSummary {
    name: string
    url: string
}

export interface PokemonListResponse {
    count: number
    next: string | null
    previous: string | null
    results: PokemonSummary[]
}

type LoadResult =
    | { type: 'SUCCESS'; payload: PokemonListResponse }
    | { type: 'ERROR'; payload: Error }

async function load(url: string, search: string): Promise<LoadResult> {
    try {
        let data: PokemonListResponse

        const cached = localStorage.getItem(url)
        if (cached) {
            data = JSON.parse(cached) as PokemonListResponse
        } else {
            const response = await axios.get<PokemonListResponse>(url)
            data = response.data
        }

        localStorage.setItem(url, JSON.stringify(data))
        data.results = data.results.filter(item => item.name.includes(search))
        return { type: 'SUCCESS', payload: data }

    } catch(error) {
        return { type: 'ERROR', payload: error instanceof Error ? error : new Error(String(error)) }
    }
}

export default load
