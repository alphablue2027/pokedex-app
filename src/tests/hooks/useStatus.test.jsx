import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import useStatus from '../../hooks/useStatus'
import { firstPage } from '../fixtures/pokeapi'

describe('useStatus', () => {
    it('starts loading with no data and no error', () => {
        const { result } = renderHook(() => useStatus())
        const [status] = result.current

        expect(status).toEqual({ loading: true, data: null, error: null })
    })

    it('stores the payload and stops loading on SUCCESS', () => {
        const { result } = renderHook(() => useStatus())
        const [, dispatch] = result.current
        const page = firstPage()

        act(() => dispatch({ type: 'SUCCESS', payload: page }))

        const [status] = result.current
        expect(status).toEqual({ loading: false, data: page, error: null })
    })

    it('stores the error and stops loading on ERROR', () => {
        const { result } = renderHook(() => useStatus())
        const [, dispatch] = result.current
        const error = new Error('Network Error')

        act(() => dispatch({ type: 'ERROR', payload: error }))

        const [status] = result.current
        expect(status).toEqual({ loading: false, data: null, error })
    })

    it('clears the previous data and error on LOADING', () => {
        const { result } = renderHook(() => useStatus())
        const [, dispatch] = result.current

        act(() => dispatch({ type: 'SUCCESS', payload: firstPage() }))
        act(() => dispatch({ type: 'LOADING' }))

        const [status] = result.current
        expect(status).toEqual({ loading: true, data: null, error: null })
    })
})
