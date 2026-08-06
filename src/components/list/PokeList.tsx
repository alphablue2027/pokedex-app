import '../../assets/styles/PokeList.css'
import Pokemon from './Pokemon'
import type { PokemonSummary } from '../../helpers/load'

function PokeList({ data }: { data: PokemonSummary[] }) {
    return (
        <ul className="poke-list">
            {data.map(item => <Pokemon {...item} key={item.name} />)}
        </ul>
    )
}

export default PokeList
