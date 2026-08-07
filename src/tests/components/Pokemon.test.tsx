import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Pokemon from '../../components/list/Pokemon'
import { pikachu } from '../fixtures/pokeapi'

describe('Pokemon', () => {
    it('derives the id and the sprite url from the api url', () => {
        render(<Pokemon {...pikachu} />)

        expect(screen.getByText('25')).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'pikachu' })).toBeInTheDocument()
        expect(screen.getByRole('img', { name: 'Sprite de pikachu' })).toHaveAttribute(
            'src',
            'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png'
        )
    })
})
