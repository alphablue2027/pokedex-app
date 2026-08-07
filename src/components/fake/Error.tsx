import '../../assets/styles/Error.css'

function ErrorRender({ onRetry }: { onRetry: () => void }) {
    return (
        <div className="error" role="alert">
            <div className='error-message'>
                <h2 className="error__title">Ha ocurrido un error en la conexión con el servidor</h2>
                <p className="error__desc">Compruebe la conexión o inténtelo más tarde</p>
            </div>
            <button className="button error__retry" onClick={onRetry}>Reintentar</button>
        </div>
    )
}

export default ErrorRender
