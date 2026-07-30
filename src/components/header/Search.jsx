function Search({ onType, ref }) {
    return (
        <input ref={ref} className="searchbox" type="text" onChange={(e) => onType(e.target.value)} />
    )
}

export default Search