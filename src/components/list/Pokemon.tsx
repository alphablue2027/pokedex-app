import type { PokemonSummary } from '../../helpers/load'

function Pokemon({ name, url }: PokemonSummary) {
    const urlItems = url.split('/')
    const id = urlItems[urlItems.length - 2]
    const src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`

    return (
        <li className="pokemon">
            <h2 className="pokemon__name">{name}</h2>
            <img className="pokemon__img" src={src} alt={`${name} sprite`} loading="lazy" />
            <h3 className="pokemon__number">{id}</h3>
        </li>
    )
}

export default Pokemon
