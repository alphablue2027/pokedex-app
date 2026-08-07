import Unknown from "./fake/Unknown"
import ErrorRender from "./fake/Error"
import FakeList from './fake/FakeList'
import PokeHeader from './header/PokeHeader'
import Button from './header/Button'
import Search from './header/Search'
import Sliders from './header/Sliders'
import PokeList from './list/PokeList'

import useConnect from "../hooks/useConnect"

function PokeApp() {
    const [
        data,
        loading,
        error,
        search,
        handleNext,
        handlePrev,
        handleType,
        handleRetry
    ] = useConnect()

    return (
        <main className="main">
            <PokeHeader>
                <Search onType={handleType} />
                <Sliders>
                    <Button onClick={handlePrev} enabled={Boolean(data?.previous)} >Página anterior</Button>
                    <Button onClick={handleNext} enabled={Boolean(data?.next)} >Página siguiente</Button>
                </Sliders>
            </PokeHeader>
            <hr />
            {error?
                <ErrorRender onRetry={handleRetry} />
                :
                loading?
                    <FakeList />
                    :
                    // el reducer solo llega acá con data seteada: !loading && !error implica éxito
                    (data!.results.length === 0)?
                        <Unknown search={search} />
                        :
                        <PokeList data={data!.results} />
            }

        </main>
    )
}

export default PokeApp
