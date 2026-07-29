import { describe, expect, it, vi } from 'vitest'
import axios from 'axios'
import load from '../../helpers/load'
import { INITIAL_URL, SEARCH_URL, firstPage, fullPage, pikachu } from '../fixtures/pokeapi'

vi.mock('axios', () => ({
    default: { get: vi.fn() }
}))

describe('load', () => {
    it('returns a SUCCESS action with the fetched page', async () => {
        axios.get.mockResolvedValue({ data: firstPage() })

        const action = await load(INITIAL_URL, '')

        expect(axios.get).toHaveBeenCalledWith(INITIAL_URL)
        expect(action.type).toBe('SUCCESS')
        expect(action.payload.results).toHaveLength(3)
    })

    it('caches the unfiltered page in localStorage', async () => {
        axios.get.mockResolvedValue({ data: fullPage() })

        await load(SEARCH_URL, 'pika')

        expect(JSON.parse(localStorage.getItem(SEARCH_URL))).toEqual(fullPage())
    })

    it('reads from the cache instead of calling the api again', async () => {
        axios.get.mockResolvedValue({ data: firstPage() })

        await load(INITIAL_URL, '')
        const action = await load(INITIAL_URL, '')

        expect(axios.get).toHaveBeenCalledTimes(1)
        expect(action.payload.results).toHaveLength(3)
    })

    it('filters the results by the search term', async () => {
        axios.get.mockResolvedValue({ data: fullPage() })

        const action = await load(SEARCH_URL, 'pika')

        expect(action.payload.results).toEqual([pikachu])
    })

    it('returns an ERROR action when the request fails', async () => {
        const error = new Error('Network Error')
        axios.get.mockRejectedValue(error)

        const action = await load(INITIAL_URL, '')

        expect(action).toEqual({ type: 'ERROR', payload: error })
    })
})
