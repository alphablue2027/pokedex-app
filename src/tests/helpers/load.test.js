import { describe, expect, it, vi } from 'vitest'
import axios from 'axios'
import load from '../../helpers/load'
import { INITIAL_URL, SEARCH_URL, firstPage, fullPage } from '../fixtures/pokeapi'

vi.mock('axios', () => ({
    default: { get: vi.fn() }
}))

describe('load', () => {
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
})
