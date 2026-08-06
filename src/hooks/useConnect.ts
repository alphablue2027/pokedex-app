import { useState, useEffect } from "react"
import useStatus from "./useStatus"
import load from "../helpers/load"
import type { PokemonListResponse } from "../helpers/load"

type UseConnect = [
    PokemonListResponse | null,
    boolean,
    Error | null,
    () => void,
    () => void,
    (value: string) => void
]

function useConnect(): UseConnect {
    const [url, setUrl] = useState('https://pokeapi.co/api/v2/pokemon/')
    const [{ data, loading, error }, dispatch] = useStatus()
    const [search, setSearch] = useState('')

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
    }, [url, search, dispatch])

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
        if (data) {
            if (value === '') {
                setUrl('https://pokeapi.co/api/v2/pokemon/?offset=0&limit=20')
            }
            else {
                setUrl('https://pokeapi.co/api/v2/pokemon/?offset=0&limit=100000')
            }
            setSearch(value.toLowerCase())
            dispatch({ type: 'LOADING' })
        }
    }

    return [
        data,
        loading,
        error,
        handleNext,
        handlePrev,
        handleType
    ]
}

export default useConnect
