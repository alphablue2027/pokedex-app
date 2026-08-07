import '../../assets/styles/Unknown.css'

function Unknown({ search }: { search: string }) {
    const letter = /^[a-z]/.test(search) ? search[0] : 'a'
    const src = `https://img.pokemondb.net/sprites/ruby-sapphire/normal/unown-${letter}.png`

    return (
        <div className="unknown" role="status" aria-live="polite">
            <img className="unknown__img" src={src} alt="icono de letra" />
            <div className="unknown-text">
                <h2 className="unknown__title">Pokémon no encontrado</h2>
                <p className="unknown__desc">Prueba con otro nombre!</p>
            </div>
        </div>
    )
}

export default Unknown
