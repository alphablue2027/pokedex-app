import type { ReactNode } from 'react'

function Button({ children, onClick, enabled }: { children: ReactNode; onClick: () => void; enabled: boolean }) {
    return (
        <button className={`button ${!enabled? 'inactive' : ''}`} onClick={onClick} disabled={!enabled} >{children}</button>
    )
}

export default Button
