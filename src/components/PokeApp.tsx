import Unknown from "./fake/Unknown"
import ErrorRender from "./fake/Error"
import FakeList from './fake/FakeList'
import PokeHeader from './header/PokeHeader'
import Button from './header/Button'
import Search from './header/Search'
import Sliders from './header/Sliders'
import PokeList from './list/PokeList'

import useConnect from "../hooks/useConnect"
import { useRef } from "react"

function PokeApp() {
    const [
        data,
        loading,
        error,
        handleNext,
        handlePrev,
        handleType
    ] = useConnect()
    const searchRef = useRef<HTMLInputElement>(null)

    return (
        <main className="main">
            <PokeHeader>
                <Search onType={handleType} ref={searchRef} />
                <Sliders>
                    <Button onClick={handlePrev} enabled={Boolean(data?.previous)} >Previous Page</Button>
                    <Button onClick={handleNext} enabled={Boolean(data?.next)} >Next Page</Button>
                </Sliders>
            </PokeHeader>
            <hr />
            {error?
                <ErrorRender />
                :
                loading?
                    <FakeList />
                    :
                    // el reducer solo llega acá con data seteada: !loading && !error implica éxito
                    (data!.results.length === 0)?
                        <Unknown ref={searchRef} />
                        :
                        <PokeList data={data!.results} />
            }

        </main>
    )
}

export default PokeApp
