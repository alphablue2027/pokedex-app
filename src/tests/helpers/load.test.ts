import { describe, expect, it, vi } from 'vitest'
import axios from 'axios'
import load from '../../helpers/load'
import { INITIAL_URL, SEARCH_URL, firstPage, fullPage } from '../fixtures/pokeapi'

vi.mock('axios', () => ({
    default: { get: vi.fn() }
}))

describe('load', () => {
    it('caches the unfiltered page in localStorage', async () => {
        vi.mocked(axios.get).mockResolvedValue({ data: fullPage() })

        await load(SEARCH_URL, 'pika')

        expect(JSON.parse(localStorage.getItem(SEARCH_URL)!)).toEqual(fullPage())
    })

    it('reads from the cache instead of calling the api again', async () => {
        vi.mocked(axios.get).mockResolvedValue({ data: firstPage() })

        await load(INITIAL_URL, '')
        const action = await load(INITIAL_URL, '')

        expect(axios.get).toHaveBeenCalledTimes(1)
        if (action.type !== 'SUCCESS') throw new Error('expected SUCCESS')
        expect(action.payload.results).toHaveLength(3)
    })

    it('normalizes a non-Error rejection into an Error', async () => {
        vi.mocked(axios.get).mockRejectedValue('network down')

        const action = await load(INITIAL_URL, '')

        if (action.type !== 'ERROR') throw new Error('expected ERROR')
        expect(action.payload).toBeInstanceOf(Error)
        expect(action.payload.message).toBe('network down')
    })

    it('still succeeds when caching the response exceeds the storage quota', async () => {
        vi.mocked(axios.get).mockResolvedValue({ data: firstPage() })
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new DOMException('quota exceeded', 'QuotaExceededError')
        })

        const action = await load(INITIAL_URL, '')

        if (action.type !== 'SUCCESS') throw new Error('expected SUCCESS')
        expect(action.payload.results).toHaveLength(3)
    })
})
