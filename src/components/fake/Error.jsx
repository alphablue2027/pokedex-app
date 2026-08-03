import '../../assets/styles/Error.css'

function ErrorRender() {
    return (
        <div className="error" role="alert">
            <h2 className="error__title">Ha ocurrido un error en la conexión con el servidor</h2>
            <h3 className="error__desc">Compruebe la conexión o inténtelo mas tarde</h3>
        </div>
    )
}

export default ErrorRender