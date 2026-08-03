function Button({ children, onClick, enabled }) {
    return (
        <button className={`button ${!enabled? 'inactive' : ''}`} onClick={onClick} disabled={!enabled} >{children}</button>
    )
}

export default Button