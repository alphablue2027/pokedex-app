import '../../assets/styles/PokeHeader.css'

function PokeHeader({ children }) {
    return(
        <header className="poke-header">
            <div className="title">
                <img className="title__img" src="https://share.google/images/usZHFptpXyMCcNhWR" alt="Pokedex img" />
                <h1 className="title__text">Pokedex</h1>
            </div>
            { children }
        </header>
    )
}

export default PokeHeader