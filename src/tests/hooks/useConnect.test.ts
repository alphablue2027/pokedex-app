import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import axios from 'axios'
import type { AxiosResponse } from 'axios'
import useConnect from '../../hooks/useConnect'
import type { PokemonListResponse } from '../../types'
import {
    INITIAL_URL,
    NEXT_URL,
    RESET_URL,
    SEARCH_URL,
    firstPage,
    lastPage,
    fullPage,
    eevee,
    pikachu
} from '../fixtures/pokeapi'
import { mockPages, mockApiFailure } from '../fixtures/apiMock'

vi.mock('axios', () => ({
    default: { get: vi.fn() }
}))

function read(result: { current: ReturnType<typeof useConnect> }) {
    const [data, loading, error, search, handleNext, handlePrev, handleType, handleRetry] = result.current
    return { data, loading, error, search, handleNext, handlePrev, handleType, handleRetry }
}

async function renderLoaded(pages: Record<string, () => ReturnType<typeof firstPage>>) {
    mockPages(pages)
    const { result } = renderHook(() => useConnect())
    await waitFor(() => expect(read(result).loading).toBe(false))
    return result
}

describe('useConnect', () => {
    it('starts loading and exposes the first page once it resolves', async () => {
        mockPages({ [INITIAL_URL]: firstPage })
        const { result } = renderHook(() => useConnect())

        expect(read(result).loading).toBe(true)
        expect(read(result).data).toBeNull()

        await waitFor(() => expect(read(result).loading).toBe(false))

        expect(read(result).data!.results).toHaveLength(3)
        expect(read(result).error).toBeNull()
    })

    it('exposes the error when the request fails', async () => {
        mockApiFailure()
        const { result } = renderHook(() => useConnect())

        await waitFor(() => expect(read(result).loading).toBe(false))

        expect(read(result).error).toBeInstanceOf(Error)
        expect(read(result).data).toBeNull()
    })

    it('retries the same request when handleRetry is called after a failure', async () => {
        mockApiFailure()
        const { result } = renderHook(() => useConnect())
        await waitFor(() => expect(read(result).loading).toBe(false))
        expect(read(result).error).toBeInstanceOf(Error)

        mockPages({ [INITIAL_URL]: firstPage })
        act(() => read(result).handleRetry())

        await waitFor(() => expect(read(result).loading).toBe(false))
        expect(read(result).error).toBeNull()
        expect(read(result).data!.results).toHaveLength(3)
    })

    it('discards a stale response that resolves after a newer request replaced it', async () => {
        let resolveStale: (value: AxiosResponse<PokemonListResponse>) => void = () => {}
        const staleResponse = new Promise<AxiosResponse<PokemonListResponse>>(resolve => {
            resolveStale = resolve
        })

        vi.mocked(axios.get)
            .mockImplementationOnce(() => staleResponse)
            .mockImplementationOnce(() => Promise.resolve({ data: fullPage() } as AxiosResponse<PokemonListResponse>))

        const { result } = renderHook(() => useConnect())

        act(() => read(result).handleType('pika'))
        await waitFor(() => expect(read(result).loading).toBe(false))
        expect(read(result).data!.results).toEqual([pikachu])

        await act(async () => {
            resolveStale({ data: firstPage() } as AxiosResponse<PokemonListResponse>)
            await new Promise(resolve => setTimeout(resolve, 0))
        })

        expect(read(result).data!.results).toEqual([pikachu])
    })

    it('requests the next page when handleNext is called', async () => {
        const result = await renderLoaded({ [INITIAL_URL]: firstPage, [NEXT_URL]: lastPage })

        act(() => read(result).handleNext())
        await waitFor(() => expect(read(result).loading).toBe(false))

        expect(axios.get).toHaveBeenCalledWith(NEXT_URL)
        expect(read(result).data!.results).toEqual([eevee])
    })

    it('requests the previous page when handlePrev is called', async () => {
        const result = await renderLoaded({ [INITIAL_URL]: lastPage, [RESET_URL]: firstPage })

        act(() => read(result).handlePrev())
        await waitFor(() => expect(read(result).loading).toBe(false))

        expect(axios.get).toHaveBeenCalledWith(RESET_URL)
        expect(read(result).data!.results).toHaveLength(3)
    })

    it('ignores handleNext on the last page', async () => {
        const result = await renderLoaded({ [INITIAL_URL]: lastPage })

        act(() => read(result).handleNext())

        expect(axios.get).toHaveBeenCalledTimes(1)
        expect(read(result).loading).toBe(false)
    })

    it('ignores handlePrev on the first page', async () => {
        const result = await renderLoaded({ [INITIAL_URL]: firstPage })

        act(() => read(result).handlePrev())

        expect(axios.get).toHaveBeenCalledTimes(1)
        expect(read(result).loading).toBe(false)
    })

    it('requests the full list and filters it when the user searches', async () => {
        const result = await renderLoaded({ [INITIAL_URL]: firstPage, [SEARCH_URL]: fullPage })

        act(() => read(result).handleType('pika'))
        await waitFor(() => expect(read(result).loading).toBe(false))

        expect(axios.get).toHaveBeenCalledWith(SEARCH_URL)
        expect(read(result).data!.results).toEqual([pikachu])
    })

    it('matches the search term case-insensitively', async () => {
        const result = await renderLoaded({ [INITIAL_URL]: firstPage, [SEARCH_URL]: fullPage })

        act(() => read(result).handleType('PIKA'))
        await waitFor(() => expect(read(result).loading).toBe(false))

        expect(read(result).data!.results).toEqual([pikachu])
    })

    it('goes back to the paged url when the search is cleared', async () => {
        const result = await renderLoaded({
            [INITIAL_URL]: firstPage,
            [SEARCH_URL]: fullPage,
            [RESET_URL]: firstPage
        })

        act(() => read(result).handleType('pika'))
        await waitFor(() => expect(read(result).loading).toBe(false))

        act(() => read(result).handleType(''))
        await waitFor(() => expect(read(result).loading).toBe(false))

        expect(axios.get).toHaveBeenCalledWith(RESET_URL)
        expect(read(result).data!.results).toHaveLength(3)
    })
})
