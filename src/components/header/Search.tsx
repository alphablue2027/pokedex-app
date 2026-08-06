import type { Ref } from 'react'

function Search({ onType, ref }: { onType: (value: string) => void; ref: Ref<HTMLInputElement> }) {
    return (
        <input ref={ref} className="searchbox" type="text" aria-label="Search pokemon" onChange={(e) => onType(e.target.value)} />
    )
}

export default Search
