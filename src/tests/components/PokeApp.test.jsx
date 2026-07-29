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

        expect(await screen.findByRole('heading', { name: 'Pokemon not found' })).toBeInTheDocument()
        expect(screen.getByRole('img', { name: 'letter icon' })).toHaveAttribute(
            'src',
            'https://img.pokemondb.net/sprites/ruby-sapphire/normal/unown-z.png'
        )
    })

    it('loads the next page when the user clicks Next Page', async () => {
        const user = userEvent.setup()
        mockPages({ [INITIAL_URL]: firstPage, [NEXT_URL]: lastPage })
        render(<PokeApp />)
        await screen.findByRole('heading', { name: 'bulbasaur' })

        await user.click(screen.getByRole('button', { name: 'Next Page' }))

        expect(await screen.findByRole('heading', { name: 'eevee' })).toBeInTheDocument()
        expect(axios.get).toHaveBeenCalledWith(NEXT_URL)
    })

    it('marks each pagination button according to the current page', async () => {
        mockPages({ [INITIAL_URL]: firstPage })
        render(<PokeApp />)
        await screen.findByRole('heading', { name: 'bulbasaur' })

        expect(screen.getByRole('button', { name: 'Previous Page' })).toHaveClass('inactive')
        expect(screen.getByRole('button', { name: 'Next Page' })).not.toHaveClass('inactive')
    })
})
