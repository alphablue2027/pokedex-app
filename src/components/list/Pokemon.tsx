import type { PokemonSummary } from '../../types'

function Pokemon({ name, url }: PokemonSummary) {
    const urlItems = url.split('/')
    const id = urlItems[urlItems.length - 2]
    const src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`

    return (
        <li className="pokemon">
            <h2 className="pokemon__name">{name}</h2>
            <img className="pokemon__img" src={src} alt={`Sprite de ${name}`} loading="lazy" />
            <span className="pokemon__number">{id}</span>
        </li>
    )
}

export default Pokemon
