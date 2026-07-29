# CLAUDE.md — pokedex

Convenciones propias de este repo. Lo que aplica a todos los proyectos vive en `~/.claude/CLAUDE.md` y no se repite acá.

## El proyecto

Vite + React 19, JavaScript (sin TypeScript), sin router. Consume la PokeAPI vía axios y cachea cada respuesta en `localStorage`. Deploy a GitHub Pages con `npm run deploy` (`gh-pages -d dist`); por eso `vite.config.js` tiene `base: '/pokedex/'`. `dist/` está en `.gitignore` y no se versiona.

Estado y features viven en `README.md` — puede estar desactualizado, verificar contra el código.

## Módulo de tests

Vitest 3 + Testing Library + jsdom. **26 tests en 5 archivos, 96.62% de statements, sin acceso a red.**

```
src/tests/
  setup.js                    cleanups automáticos para toda la suite
  fixtures/pokeapi.js         datos y URLs — fuente única de verdad
  fixtures/apiMock.js         mockPages() y mockApiFailure()
  components/PokeApp.test.jsx  integración: las 4 ramas + interacción real
  components/Pokemon.test.jsx  derivación del id desde la url
  helpers/load.test.js
  hooks/useConnect.test.jsx
  hooks/useStatus.test.jsx
```

### Decisiones tomadas — no volver a preguntar

- **Los tests van en `src/tests/`**, espejando la estructura de `src/`. No colocados junto al código. Confirmado 2026-07-28.
- **La config de Vitest va en `vite.config.js`**, en un solo archivo, con `defineConfig` importado de `vitest/config` (superset del de Vite, conoce la clave `test`). Nada de `vitest.config.js` aparte. Confirmado 2026-07-28.
- **Nombres según la convención de Vitest**: `describe` con el nombre real del módulo, `it` con el comportamiento en minúscula como frase. `describe('useConnect')` + `it('ignores handleNext on the last page')`, no `describe('UseConnect Hook Testing')` + `test('Default Return Test')`. Confirmado 2026-07-28.
- **Solo se testea lo crítico.** Markup estático, componentes que solo mapean y wrappers de una línea no llevan test propio: quedan cubiertos por el test de integración. Sin snapshots.

### Cómo están armados los tests

- **`globals: false`** → hay que importar `describe`, `it`, `expect` y `vi` de `vitest` en cada archivo. Ojo: con globals apagado, Testing Library **no** registra su auto-cleanup, por eso `setup.js` llama a `cleanup()` a mano.
- **`restoreMocks: true`** → cada test configura su propio escenario. No hay `beforeEach` compartido con una respuesta por defecto, y los contadores de llamadas arrancan en cero en cada test.
- **`setup.js` limpia `localStorage`** además de desmontar. `load.js` cachea por URL y jsdom no lo limpia solo; sin eso, un test lee del caché del anterior y `axios.get` no se llama.
- **Mock de axios con factory explícita**, no automock: `vi.mock('axios', () => ({ default: { get: vi.fn() } }))`. Declara la superficie real que usa la app y falla ruidosamente si alguien usa otro método.
- **Las páginas de las fixtures son funciones, no objetos.** `load` hace `data.results = data.results.filter(...)`, o sea muta lo que recibe. Con objetos compartidos a nivel módulo, un test con búsqueda truncaría la página para todos los tests siguientes del archivo.
- **Queries por rol con `screen`** (`getByRole('button', { name: 'Next Page' })`), nunca `container.querySelector('.clase')`. Afirmar sobre una clase (`toHaveClass`) sí está bien cuando esa clase es el contrato del componente y el elemento se encontró por rol.
- **`userEvent`, no `fireEvent`.** Siempre `await`, y `userEvent.setup()` antes del `render`.

### Antes de dar un test por bueno

**Rompé a propósito la línea de producción que decís cubrir y confirmá que se pone rojo** — el test correcto y solo ese. El test viejo de `useConnect` tenía un `waitFor` sin `await`: nunca ejecutaba una aserción y pasaba en verde, con el hook marcando 52% de cobertura.

La cobertura mide qué se ejecutó, no qué se verificó. Es piso para detectar agujeros, no meta a maximizar.

### Sin cobertura a propósito

- `App.jsx` — wrapper de una línea.
- `useStatus.jsx:34`, el `default: return state` del reducer — rama defensiva; si se rompiera, ningún usuario lo notaría.

## Pendiente

**CI (en pausa).** Ordnay está estudiando GitHub Actions de la doc oficial antes de encararlo. Cuando se retome:

- Instalar `@vitest/coverage-v8` como devDependency (el bloque `coverage` ya está configurado en `vite.config.js`, pero el provider no está instalado).
- Agregar scripts `test:run` (`vitest run`) y `test:coverage`. **`npm test` corre en modo watch y en CI se cuelga esperando cambios.**
- Workflow en `.github/workflows` con `npm ci` + lint + tests.

## Decisiones abiertas — preguntar antes de actuar

- **`propTypes` es dead code.** React 19 eliminó la validación de `propTypes`, así que todos los bloques del proyecto se ignoran en silencio y `prop-types` es una dependencia inerte (verificado: renderizar `<Button />` sin sus props `isRequired` no emite ningún warning). Sin propTypes activos ni TypeScript, los tests son la única red de contención. Opciones planteadas y sin resolver: sacarlos, dejarlos anotados como deuda, o migrar a TypeScript.
- **`aria-label` en el input de búsqueda** (`Search.jsx`). Hoy no tiene nombre accesible: se puede consultar con `getByRole('textbox')` pero no por nombre. Es un hueco real de a11y y un cambio de una línea, pero es código de producción.

## Bugs detectados y no corregidos

- **`PokeHeader.jsx:8`** — el `src` del logo es `https://share.google/images/usZHFptpXyMCcNhWR`, que es un share link de Google, no una URL de imagen. El logo no carga en producción.
- **Los botones de paginación no están realmente deshabilitados.** La clase `inactive` solo los pinta; siguen siendo clickeables y tabulables. Lo que evita navegar de más es la guarda dentro de `useConnect`, no el botón. `disabled={!enabled}` lo resolvería.
