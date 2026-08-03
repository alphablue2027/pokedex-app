# CLAUDE.md — pokedex

Convenciones propias de este repo. Lo que aplica a todos los proyectos vive en `~/.claude/CLAUDE.md` y no se repite acá.

## El proyecto

Vite + React 19, JavaScript (sin TypeScript, sin propTypes). Sin router. Consume la PokeAPI vía axios y cachea cada respuesta en `localStorage` por URL completa, sin TTL/invalidación. Deploy a GitHub Pages, hoy automatizado por CI. `dist/` está en `.gitignore`.

**El repo en GitHub se llama `pokedex-app`, no `pokedex`.** Fue renombrado en algún momento; el directorio local y el remote siguen diciendo `pokedex` y GitHub redirige. Por eso `vite.config.js` tiene `base: '/pokedex-app/'`: Pages sirve en `https://chrysalcore.github.io/pokedex-app/`, y si el `base` no coincide con el nombre del repo los assets dan 404 y la página queda en blanco. Ya rompió producción una vez sin que nadie lo notara.

**`chrysalcore` es una organización, no una cuenta personal.** La política de Actions de la org cascadea y deja *en gris* los controles equivalentes a nivel repo — si algo de permisos de workflow no se deja cambiar, se cambia en `https://github.com/organizations/chrysalcore/settings/actions`, no en el repo.

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

**Scripts:** `npm test` es watch mode (cuelga en CI), `npm run test:run` es la corrida única, `npm run test:coverage` agrega cobertura vía `@vitest/coverage-v8`. Hoy da 96% de statements. `coverage/` está en `.gitignore`.

**Sin cobertura a propósito:** `App.jsx` (wrapper de una línea), `useStatus.jsx:34` (`default: return state`, rama defensiva que nadie notaría si se rompiera).

## CI/CD

Dos workflows en `.github/workflows/`, separados porque disparan en eventos distintos:

- **`ci.yml`** — push a `development` (o manual). Job `test`: `npm ci` + `npm run lint` + `npm run test:run`. Job `open-pr`: si `test` pasó y no hay PR abierto, abre `development → main` con `gh pr create`.
- **`deploy.yml`** — push a `main` (o manual). `npm ci` + `npm run build` + publish de `dist/` a la rama `gh-pages` con `peaceiris/actions-gh-pages`. No repite tests: a `main` solo se llega vía el PR, que ya corrió en verde.

Node 22 en CI, para igualar el local. `main` tiene un ruleset "Main Protection" (`active`): PR obligatorio con **0 approvals**, required status check `test` pinneado a GitHub Actions, restrict deletions, block force pushes, sin "require up to date". Bypass: `OrganizationAdmin`, o sea que las reglas no atan a Ordnay.

**Decisiones fijas — no volver a preguntar:**
- Deploy en push a `main` (post-merge), nunca desde `development`.
- El PR a `main` se crea solo, pero **se mergea a mano**. Nada de auto-merge.
- Se publica a la rama `gh-pages` (Pages ya está configurado así, `build_type: legacy`), no con Pages nativo por Actions.
- **Sin `paths-ignore`: CI corre siempre**, aunque el push sea solo `.md`.

**Gotchas no obvios, todos verificados acá:**
- **`paths-ignore` + required status checks = deadlock.** Es un filtro a nivel workflow: si el push solo toca `.md` el workflow nunca corre, así que para ese SHA nunca se reporta el check, y el PR queda en *"Expected — waiting for status"* para siempre. Por eso no hay filtro. Es la razón de la decisión, no un olvido.
- **Los checks se asocian al SHA, no al evento.** La corrida disparada por el push a `development` satisface el required check del PR porque el head del PR *es* ese mismo commit. Verificado: `mergeStateStatus: CLEAN`. Por eso no hace falta un PAT.
- **Un PR creado con el `GITHUB_TOKEN` no dispara workflows** (anti-loop de GitHub). No molesta acá porque los tests corren *antes* de abrir el PR, pero sí lo haría si se agregara un trigger `pull_request`.
- **`workflow_dispatch` solo aparece para workflows que ya están en la rama default.** Un workflow nuevo que vive solo en `development` no se puede lanzar a mano hasta que se mergee.
- Un status check no aparece en el selector del ruleset hasta que **corrió al menos una vez**. Primero pushear, después crear la regla.
- `npm test` corre en watch mode y cuelga CI: en workflows va `test:run`.

## Pendiente

- **Búsqueda: fetch y render de dataset completo sin paginar.** La PokeAPI no tiene endpoint de búsqueda por texto — `useConnect.jsx` lo resuelve pidiendo la lista completa (`limit=100000`) y filtrando client-side. El resultado filtrado se renderiza entero en un `<ul>` sin paginar (`PokeList.jsx`), y cada tecla re-parsea/re-filtra ese JSON completo desde `localStorage`. Decisión tomada: virtualizar con **`@tanstack/react-virtual`** (headless, se acopla al layout flex-wrap actual sin forzar grid de columnas fijas; sucesor activo de `react-window`/`react-virtualized`, ambas en mantenimiento o abandonadas). Falta implementar.

## Accesibilidad — hecho

`aria-label` en el input de `Search.jsx`; `alt` por pokemon y `loading="lazy"` en `Pokemon.jsx`; `role="status"`/`aria-live` en `FakeList` y `Unknown.jsx`, `role="alert"` en `Error.jsx`; `disabled` real en `Button.jsx` además de la clase `inactive`.

**Ojo con `PokeList.css`:** en `Pokemon.jsx` el `h2` (nombre) va **antes** que el `img` y el `h3` (número) en el DOM, para que la jerarquía de headings no quede invertida. El orden *visual* de siempre (imagen arriba, nombre abajo) se mantiene con `order` en `.pokemon__img` / `.pokemon__name`. Si alguien reordena el JSX "para que coincida con lo que se ve", rompe la jerarquía otra vez.

Falta prueba manual con teclado y lector de pantalla: los scanners automáticos detectan entre un cuarto y un tercio de los problemas de WCAG.

## Decisiones fijas — no volver a preguntar (proyecto en general)

- **Sin `propTypes`.** React 19 eliminó su validación (verificado: `<Button />` sin sus props `isRequired` no emitía warning), así que era una dependencia inerte. Se sacó de todos los componentes y de `package.json`. Sin TypeScript tampoco, los tests son la única red de contención de tipos.

## Bugs detectados y no corregidos

- **`PokeHeader.jsx:8`** — el `src` del logo es un share link de Google (`https://share.google/images/...`), no una URL de imagen. No carga en producción.
