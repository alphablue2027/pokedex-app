function Search({ onType, ref }) {
    return (
        <input ref={ref} className="searchbox" type="text" aria-label="Search pokemon" onChange={(e) => onType(e.target.value)} />
    )
}

export default Search