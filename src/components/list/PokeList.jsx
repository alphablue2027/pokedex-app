import '../../assets/styles/PokeList.css'
import Pokemon from './Pokemon'

function PokeList({ data }) {
    return (
        <ul className="poke-list">
            {data.map(item => <Pokemon {...item} key={item.name} />)}
        </ul>
    )
}

export default PokeList