# CLAUDE.md — pokedex

Convenciones propias de este repo. Lo que aplica a todos los proyectos vive en `~/.claude/CLAUDE.md` y no se repite acá.

## El proyecto

Vite + React 19, JavaScript (sin TypeScript, sin propTypes). Sin router. Consume la PokeAPI vía axios y cachea cada respuesta en `localStorage` por URL completa, sin TTL/invalidación. Deploy a GitHub Pages con `npm run deploy` (`gh-pages -d dist`); por eso `vite.config.js` tiene `base: '/pokedex/'`. `dist/` está en `.gitignore`.

Estado y features viven en `README.md` — puede estar desactualizado, verificar contra el código.

## Tests

Vitest 3 + Testing Library + jsdom. 23 tests en 5 archivos, sin acceso a red.

```
src/tests/
  setup.js                     cleanups automáticos para toda la suite
  fixtures/pokeapi.js          datos y URLs — fuente única de verdad
  fixtures/apiMock.js          mockPages() y mockApiFailure()
  components/PokeApp.test.jsx   integración: las 4 ramas + interacción real
  components/Pokemon.test.jsx   derivación del id desde la url
  helpers/load.test.js
  hooks/useConnect.test.jsx
  hooks/useStatus.test.jsx
```

**Decisiones fijas — no volver a preguntar:**
- Tests en `src/tests/` espejando `src/`, no junto al código.
- Config de Vitest en `vite.config.js` (`defineConfig` de `vitest/config`), no `vitest.config.js` aparte.
- Nombres estilo Vitest: `describe('useConnect')` + `it('comportamiento en minúscula')`, no `describe('Hook Testing')` + `test('Default Return Test')`.
- Solo se testea lo crítico: markup estático, mapeos simples y wrappers de una línea quedan cubiertos por el test de integración. Sin snapshots.
- `load.test.js` no repite lo que ya cubre `useConnect.test.jsx` (integra `load` real contra el mismo mock de axios). Se limita a lo que solo se observa aislado: cacheo en `localStorage` y que el cache evita refetch.

**Gotchas no obvios del setup:**
- `globals: false` → importar `describe/it/expect/vi` en cada archivo; Testing Library no auto-registra cleanup, `setup.js` lo llama a mano.
- `restoreMocks: true` → cada test arma su propio escenario, sin default compartido.
- `setup.js` también limpia `localStorage` (jsdom no lo hace solo; sin eso un test lee el cache del anterior).
- Mock de axios con factory explícita (`vi.mock('axios', () => ({ default: { get: vi.fn() } }))`), no automock.
- Fixtures de páginas son funciones, no objetos: `load` muta `data.results` in place, un objeto compartido a nivel módulo se corrompería entre tests.
- Queries por rol (`screen.getByRole`), nunca `container.querySelector`. `toHaveClass` está bien cuando la clase es el contrato del componente y ya se encontró por rol.
- `userEvent` (con `await` y `.setup()` antes del render), no `fireEvent`.

**Antes de dar un test por bueno:** romper a propósito la línea de producción que dice cubrir y confirmar que se pone rojo. La cobertura mide qué se ejecutó, no qué se verificó — el test viejo de `useConnect` tenía un `waitFor` sin `await`, pasaba en verde sin ejecutar ninguna aserción real.

**Sin cobertura a propósito:** `App.jsx` (wrapper de una línea), `useStatus.jsx:34` (`default: return state`, rama defensiva que nadie notaría si se rompiera).

## Pendiente

- **CI (en pausa).** Ordnay está estudiando GitHub Actions antes de encararlo. Cuando se retome: instalar `@vitest/coverage-v8` (el bloque `coverage` de `vite.config.js` ya existe, falta el provider), agregar scripts `test:run`/`test:coverage` (`npm test` corre en watch mode y cuelga CI), workflow con `npm ci` + lint + tests.

- **Búsqueda: fetch y render de dataset completo sin paginar.** La PokeAPI no tiene endpoint de búsqueda por texto — `useConnect.jsx` lo resuelve pidiendo la lista completa (`limit=100000`) y filtrando client-side. El resultado filtrado se renderiza entero en un `<ul>` sin paginar (`PokeList.jsx`), y cada tecla re-parsea/re-filtra ese JSON completo desde `localStorage`. Decisión tomada: virtualizar con **`@tanstack/react-virtual`** (headless, se acopla al layout flex-wrap actual sin forzar grid de columnas fijas; sucesor activo de `react-window`/`react-virtualized`, ambas en mantenimiento o abandonadas). Falta implementar.

- **Accesibilidad general** — encarar junto con lo anterior:
  - `aria-label` en el input de `Search.jsx` (hoy sin nombre accesible).
  - `alt` descriptivo por pokemon en `Pokemon.jsx` (hoy `alt="pokemon img"` genérico).
  - `aria-live`/`role="alert"` en loading (`FakeList`), error (`Error.jsx`) y sin resultados (`Unknown.jsx`) — hoy no se anuncian a lectores de pantalla.
  - `disabled` real en `Button.jsx` (hoy solo pinta con la clase `inactive`; el guard real está en `useConnect`, no en el botón — sigue siendo clickeable/tabulable).
  - Orden de headings en `Pokemon.jsx`: hoy `h3` (número) antes que `h2` (nombre), invierte la jerarquía.
  - `loading="lazy"` en las imágenes de `Pokemon.jsx`.

## Decisiones fijas — no volver a preguntar (proyecto en general)

- **Sin `propTypes`.** React 19 eliminó su validación (verificado: `<Button />` sin sus props `isRequired` no emitía warning), así que era una dependencia inerte. Se sacó de todos los componentes y de `package.json`. Sin TypeScript tampoco, los tests son la única red de contención de tipos.

## Bugs detectados y no corregidos

- **`PokeHeader.jsx:8`** — el `src` del logo es un share link de Google (`https://share.google/images/...`), no una URL de imagen. No carga en producción.
