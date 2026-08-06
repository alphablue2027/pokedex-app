import axios from 'axios'
import type { AxiosResponse } from 'axios'
import { vi } from 'vitest'
import type { PokemonListResponse } from '../../types'

export function mockPages(pages: Record<string, () => PokemonListResponse>) {
    vi.mocked(axios.get).mockImplementation(url => (
        url in pages
            ? Promise.resolve({ data: pages[url]() } as AxiosResponse<PokemonListResponse>)
            : Promise.reject(new Error(`unexpected request to ${url}`))
    ))
}

export function mockApiFailure(error: Error = new Error('Network Error')) {
    vi.mocked(axios.get).mockRejectedValue(error)
    return error
}
