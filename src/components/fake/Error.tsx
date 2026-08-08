import '../../assets/styles/Error.css'

function ErrorRender({ onRetry }: { onRetry: () => void }) {
    return (
        <div className="error" role="alert">
            <h2 className="error__title">Ha ocurrido un error en la conexión con el servidor</h2>
            <p className="error__desc">Compruebe la conexión o inténtelo más tarde</p>
            <button className="button error__retry" onClick={onRetry}>Reintentar</button>
        </div>
    )
}

export default ErrorRender
