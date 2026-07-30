function Button({ children, onClick, enabled }) {
    return (
        <button className={`button ${!enabled? 'inactive' : ''}`} onClick={onClick} >{children}</button>
    )
}

export default Button