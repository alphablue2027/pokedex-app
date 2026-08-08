function Search({ onType }: { onType: (value: string) => void }) {
    return (
        <input className="searchbox" type="text" aria-label="Buscar pokemon" onChange={(e) => onType(e.target.value)} />
    )
}

export default Search
