import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import axios from 'axios'
import PokeApp from '../../components/PokeApp'
import { INITIAL_URL, NEXT_URL, SEARCH_URL, firstPage, lastPage, fullPage } from '../fixtures/pokeapi'
import { mockPages, mockApiFailure } from '../fixtures/apiMock'

vi.mock('axios', () => ({
    default: { get: vi.fn() }
}))

describe('PokeApp', () => {
    it('shows the loading skeleton until the first page resolves', async () => {
        mockPages({ [INITIAL_URL]: firstPage })
        render(<PokeApp />)

        expect(screen.getAllByRole('listitem')).toHaveLength(20)

        expect(await screen.findByRole('heading', { name: 'bulbasaur' })).toBeInTheDocument()
    })

    it('renders the fetched pokemon once the page resolves', async () => {
        mockPages({ [INITIAL_URL]: firstPage })
        render(<PokeApp />)

        expect(await screen.findByRole('heading', { name: 'bulbasaur' })).toBeInTheDocument()
        expect(screen.getAllByRole('listitem')).toHaveLength(3)
    })

    it('shows the error message when the request fails', async () => {
        mockApiFailure()
        render(<PokeApp />)

        expect(await screen.findByRole('heading', { name: /error en la conexión/i })).toBeInTheDocument()
        expect(screen.queryAllByRole('listitem')).toHaveLength(0)
    })

    it('filters the list as the user types', async () => {
        const user = userEvent.setup()
        mockPages({ [INITIAL_URL]: firstPage, [SEARCH_URL]: fullPage })
        render(<PokeApp />)
        await screen.findByRole('heading', { name: 'bulbasaur' })

        await user.type(screen.getByRole('textbox'), 'pika')

        expect(await screen.findByRole('heading', { name: 'pikachu' })).toBeInTheDocument()
        await waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(1))
    })

    it('shows the not found state when the search matches nothing', async () => {
        const user = userEvent.setup()
        mockPages({ [INITIAL_URL]: firstPage, [SEARCH_URL]: fullPage })
        render(<PokeApp />)
        await screen.findByRole('heading', { name: 'bulbasaur' })

        await user.type(screen.getByRole('textbox'), 'zzz')

        expect(await screen.findByRole('heading', { name: 'Pokémon no encontrado' })).toBeInTheDocument()
        expect(screen.getByRole('img', { name: 'icono de letra' })).toHaveAttribute(
            'src',
            'https://img.pokemondb.net/sprites/ruby-sapphire/normal/unown-z.png'
        )
    })

    it('resolves the unknown sprite from an uppercase search term', async () => {
        const user = userEvent.setup()
        mockPages({ [INITIAL_URL]: firstPage, [SEARCH_URL]: fullPage })
        render(<PokeApp />)
        await screen.findByRole('heading', { name: 'bulbasaur' })

        await user.type(screen.getByRole('textbox'), 'Zzz')

        expect(await screen.findByRole('heading', { name: 'Pokémon no encontrado' })).toBeInTheDocument()
        expect(screen.getByRole('img', { name: 'icono de letra' })).toHaveAttribute(
            'src',
            'https://img.pokemondb.net/sprites/ruby-sapphire/normal/unown-z.png'
        )
    })

    it('falls back to a fixed unknown sprite for a non-letter search term', async () => {
        const user = userEvent.setup()
        mockPages({ [INITIAL_URL]: firstPage, [SEARCH_URL]: fullPage })
        render(<PokeApp />)
        await screen.findByRole('heading', { name: 'bulbasaur' })

        await user.type(screen.getByRole('textbox'), '99')

        expect(await screen.findByRole('heading', { name: 'Pokémon no encontrado' })).toBeInTheDocument()
        expect(screen.getByRole('img', { name: 'icono de letra' })).toHaveAttribute(
            'src',
            'https://img.pokemondb.net/sprites/ruby-sapphire/normal/unown-a.png'
        )
    })

    it('recovers after a failed request once the user retries', async () => {
        const user = userEvent.setup()
        mockApiFailure()
        render(<PokeApp />)

        expect(await screen.findByRole('heading', { name: /error en la conexión/i })).toBeInTheDocument()

        mockPages({ [INITIAL_URL]: firstPage })
        await user.click(screen.getByRole('button', { name: 'Reintentar' }))

        expect(await screen.findByRole('heading', { name: 'bulbasaur' })).toBeInTheDocument()
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('still responds to search after a failed request', async () => {
        const user = userEvent.setup()
        mockApiFailure()
        render(<PokeApp />)
        await screen.findByRole('heading', { name: /error en la conexión/i })

        mockPages({ [SEARCH_URL]: fullPage })
        await user.type(screen.getByRole('textbox'), 'pika')

        expect(await screen.findByRole('heading', { name: 'pikachu' })).toBeInTheDocument()
    })

    it('loads the next page when the user clicks Página siguiente', async () => {
        const user = userEvent.setup()
        mockPages({ [INITIAL_URL]: firstPage, [NEXT_URL]: lastPage })
        render(<PokeApp />)
        await screen.findByRole('heading', { name: 'bulbasaur' })

        await user.click(screen.getByRole('button', { name: 'Página siguiente' }))

        expect(await screen.findByRole('heading', { name: 'eevee' })).toBeInTheDocument()
        expect(axios.get).toHaveBeenCalledWith(NEXT_URL)
    })

    it('marks each pagination button according to the current page', async () => {
        mockPages({ [INITIAL_URL]: firstPage })
        render(<PokeApp />)
        await screen.findByRole('heading', { name: 'bulbasaur' })

        expect(screen.getByRole('button', { name: 'Página anterior' })).toHaveClass('inactive')
        expect(screen.getByRole('button', { name: 'Página siguiente' })).not.toHaveClass('inactive')
    })
})
