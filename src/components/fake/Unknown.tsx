import type { RefObject } from 'react'

function Unknown({ ref }: { ref: RefObject<HTMLInputElement | null> }) {
    const src = `https://img.pokemondb.net/sprites/ruby-sapphire/normal/unown-${ref.current!.value[0]}.png`

    return (
        <div className="unknown" role="status" aria-live="polite">
            <img className="unknown__img" src={src} alt="letter icon" />
            <div className="unknown-text">
                <h2 className="unknown__name">Pokemon not found</h2>
                <h3 className="unknown__desc">Try with another name</h3>
            </div>
        </div>
    )
}

export default Unknown
