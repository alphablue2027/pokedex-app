import { useReducer, type Dispatch } from "react"
import type { PokemonListResponse } from "../helpers/load"

type Status =
    | { loading: true; data: null; error: null }
    | { loading: false; data: PokemonListResponse; error: null }
    | { loading: false; data: null; error: Error }

export type Action =
    | { type: 'LOADING' }
    | { type: 'SUCCESS'; payload: PokemonListResponse }
    | { type: 'ERROR'; payload: Error }

function useStatus(): [Status, Dispatch<Action>] {
    const [status, dispatch] = useReducer(reducer, {
        loading: true,
        data: null,
        error: null
    })

    return [status, dispatch]
}

function reducer(state: Status, action: Action): Status {
    switch (action.type) {
        case 'LOADING':
            return {
                data: null,
                error: null,
                loading: true
            }
        case 'SUCCESS':
            return {
                data: action.payload,
                error: null,
                loading: false
            }
        case 'ERROR':
            return {
                data: null,
                error: action.payload,
                loading: false
            }
        default:
            return state
    }
}

export default useStatus
