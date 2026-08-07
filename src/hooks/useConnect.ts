import { useState, useEffect } from "react"
import useStatus from "./useStatus"
import load from "../helpers/load"
import type { PokemonListResponse } from "../types"

const BASE_URL = 'https://pokeapi.co/api/v2/pokemon/'
const RESET_URL = `${BASE_URL}?offset=0&limit=20`
const SEARCH_URL = `${BASE_URL}?offset=0&limit=100000`

type UseConnect = [
    PokemonListResponse | null,
    boolean,
    Error | null,
    string,
    () => void,
    () => void,
    (value: string) => void,
    () => void
]

function useConnect(): UseConnect {
    const [url, setUrl] = useState(BASE_URL)
    const [{ data, loading, error }, dispatch] = useStatus()
    const [search, setSearch] = useState('')
    const [reloadKey, setReloadKey] = useState(0)

    useEffect(() => {
        let ignore = false


        load(url, search)
            .then(action => {
                if (!ignore) {
                    dispatch(action)
                }
            })

        return () => {
            ignore = true
        }
    }, [url, search, reloadKey, dispatch])

    const handleNext = () => {
        if (data?.next) {
            setUrl(data.next)
            dispatch({ type: 'LOADING' })
        }
    }

    const handlePrev = () => {
        if (data?.previous) {
            setUrl(data.previous)
            dispatch({ type: 'LOADING' })
        }
    }

    const handleType = (value: string) => {
        setUrl(value === '' ? RESET_URL : SEARCH_URL)
        setSearch(value.toLowerCase())
        dispatch({ type: 'LOADING' })
    }

    const handleRetry = () => {
        dispatch({ type: 'LOADING' })
        setReloadKey(key => key + 1)
    }

    return [
        data,
        loading,
        error,
        search,
        handleNext,
        handlePrev,
        handleType,
        handleRetry
    ]
}

export default useConnect
