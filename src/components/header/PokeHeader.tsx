import type { ReactNode } from 'react'
import '../../assets/styles/PokeHeader.css'
import pokeballLogo from '../../assets/pokeball.svg'

function PokeHeader({ children }: { children: ReactNode }) {
    return(
        <header className="poke-header">
            <div className="title">
                <img className="title__img" src={pokeballLogo} alt="Logo de Pokedex" />
                <h1 className="title__text">Pokedex</h1>
            </div>
            { children }
        </header>
    )
}

export default PokeHeader
