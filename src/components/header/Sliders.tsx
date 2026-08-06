import type { ReactNode } from 'react'

function Sliders({ children }: { children: ReactNode }) {
    return (
        <div className="slider">
            { children }
        </div>
    )
}

export default Sliders
