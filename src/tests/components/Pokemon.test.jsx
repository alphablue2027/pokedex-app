import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Pokemon from '../../components/list/Pokemon'
import { pikachu } from '../fixtures/pokeapi'

describe('Pokemon', () => {
    it('derives the id and the sprite url from the api url', () => {
        render(<Pokemon {...pikachu} />)

        expect(screen.getByRole('heading', { name: '25' })).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'pikachu' })).toBeInTheDocument()
        expect(screen.getByRole('img', { name: 'pokemon img' })).toHaveAttribute(
            'src',
            'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png'
        )
    })
})
