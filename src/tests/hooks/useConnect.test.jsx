import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import axios from 'axios'
import useConnect from '../../hooks/useConnect'
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

function read(result) {
    const [data, loading, error, handleNext, handlePrev, handleType] = result.current
    return { data, loading, error, handleNext, handlePrev, handleType }
}

async function renderLoaded(pages) {
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

        expect(read(result).data.results).toHaveLength(3)
        expect(read(result).error).toBeNull()
    })

    it('exposes the error when the request fails', async () => {
        mockApiFailure()
        const { result } = renderHook(() => useConnect())

        await waitFor(() => expect(read(result).loading).toBe(false))

        expect(read(result).error).toBeInstanceOf(Error)
        expect(read(result).data).toBeNull()
    })

    it('requests the next page when handleNext is called', async () => {
        const result = await renderLoaded({ [INITIAL_URL]: firstPage, [NEXT_URL]: lastPage })

        act(() => read(result).handleNext())
        await waitFor(() => expect(read(result).loading).toBe(false))

        expect(axios.get).toHaveBeenCalledWith(NEXT_URL)
        expect(read(result).data.results).toEqual([eevee])
    })

    it('requests the previous page when handlePrev is called', async () => {
        const result = await renderLoaded({ [INITIAL_URL]: lastPage, [RESET_URL]: firstPage })

        act(() => read(result).handlePrev())
        await waitFor(() => expect(read(result).loading).toBe(false))

        expect(axios.get).toHaveBeenCalledWith(RESET_URL)
        expect(read(result).data.results).toHaveLength(3)
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
        expect(read(result).data.results).toEqual([pikachu])
    })

    it('matches the search term case-insensitively', async () => {
        const result = await renderLoaded({ [INITIAL_URL]: firstPage, [SEARCH_URL]: fullPage })

        act(() => read(result).handleType('PIKA'))
        await waitFor(() => expect(read(result).loading).toBe(false))

        expect(read(result).data.results).toEqual([pikachu])
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
        expect(read(result).data.results).toHaveLength(3)
    })
})
