function Pokemon({ name, url }) {
    const urlItems = url.split('/')
    const id = urlItems[urlItems.length - 2]
    const src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`

    return (
        <li className="pokemon">
            <h3 className="pokemon__number">{id}</h3>
            <img className="pokemon__img" src={src} alt="pokemon img" />
            <h2 className="pokemon__name">{name}</h2>
        </li>
    )
}

export default Pokemon