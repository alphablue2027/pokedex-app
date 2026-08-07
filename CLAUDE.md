# CLAUDE.md — pokedex

Convenciones propias de este repo. Lo que aplica a todos los proyectos vive en `~/.claude/CLAUDE.md` y no se repite acá.

## El proyecto

Vite + React 19, TypeScript estricto (sin propTypes — dependencia inerte en React 19). Sin router. Consume la PokeAPI vía axios y cachea cada respuesta en `localStorage` por URL completa, sin TTL/invalidación. Deploy a GitHub Pages, hoy automatizado por CI. `dist/` está en `.gitignore`.

**El repo en GitHub se llama `pokedex-app`, no `pokedex`.** El directorio local sigue diciendo `pokedex`. Por eso `vite.config.ts` tiene `base: '/pokedex-app/'`: Pages sirve en `https://alphablue2027.github.io/pokedex-app/`, y si el `base` no coincide con el nombre del repo los assets dan 404 y la página queda en blanco. Ya rompió producción una vez sin que nadie lo notara.

**Repo transferido de `chrysalcore` (org) a `alphablue2027` (cuenta personal) el 2026-08-03** — es un proyecto de práctica sin relación de negocio, así que no vive bajo la marca. El ruleset de protección de `main` y el estado de GitHub Pages sobrevivieron la transferencia sin cambios; solo cambió el owner en las URLs (remote, clone, Pages). Ya no aplica la nota de que los permisos de Actions cuelgan de una política de organización.

Estado y features viven en `README.md` — puede estar desactualizado, verificar contra el código.

## TypeScript

Migración completa desde JS puro, `strict: true` desde el arranque (2026-08-05). Setup estándar del scaffold `react-ts` de Vite: `tsconfig.json` (raíz, solo `references`) + `tsconfig.app.json` (cubre `src/`, incluye `src/tests/` sin tsconfig separado) + `tsconfig.node.json` (cubre `vite.config.ts`). `src/vite-env.d.ts` con `/// <reference types="vite/client" />` para que tipen los imports de `.svg`/`.css`.

**Decisiones fijas — no volver a preguntar:**
- `.ts` vs `.tsx` según si el archivo tiene JSX, no según si "se siente" hook o componente — `useConnect.ts`/`useStatus.ts` son `.ts` (devuelven tuplas, sin JSX) aunque antes fueran `.jsx`.
- Tipos reusados en `src/types/` (2026-08-06, alineado con `molino_rojo` — ver "Tipos compartidos" en `~/.claude/CLAUDE.md`): criterio es **reuso en 2+ archivos**, no "todo lo que sea dominio/estado". `domain.ts` tiene `PokemonSummary`/`PokemonListResponse` (usados en `load.ts`, `useConnect.ts`, `Pokemon.tsx`, `PokeList.tsx` y tests), re-exportado por el barrel `src/types/index.ts` — importar siempre desde `'../types'`. `Status`/`Action` del reducer se probaron centralizar y se revirtieron: solo se usan dentro de `useStatus.ts`, así que se quedan ahí (locales, sin exportar). Mismo criterio para `UseConnect` (la tupla de `useConnect.ts`): local al hook. (Antes esto decía "nada de carpeta `types/` de primer nivel, prohibido por convención general" — esa regla no tenía evidencia real y se corrigió tras verificar contra `molino_rojo`.)
- `npm run build` corre `tsc -b && vite build`: no se puede deployar con errores de tipos. `npm run typecheck` (`tsc -b`) corre también en CI, antes del lint, para bloquear el PR — no alcanza con que el build post-merge lo detecte tarde.
- Mocks de axios en tests: `vi.mocked(axios.get)` para tipar `.mockImplementation`/`.mockResolvedValue`/`.mockRejectedValue`, nunca `as any`. `mockPages()` castea el `AxiosResponse` simulado (`{ data }` sin el resto de campos) porque el mock solo necesita `data` — cast puntual a una forma conocida, no un escape hatch genérico.

**Bugs reales que salieron a la luz al tipar estricto (no eran visibles en JS):**
- `load.ts`: el `catch` recibe `unknown` bajo `strict` (`useUnknownInCatchVariables`). Se normaliza con `error instanceof Error ? error : new Error(String(error))` antes de devolverlo como `payload: Error`.
- `Button`: `enabled` recibía directo `data?.next` (un `string | null | undefined`, la URL de paginación) usado como si fuera boolean vía coerción implícita de JS. Ahora `enabled: boolean` en la prop, y los call sites en `PokeApp.tsx` pasan `Boolean(data?.next)` / `Boolean(data?.previous)` — mismo resultado observable, ahora explícito.

**Aserciones no-nulas justificadas (invariantes reales, no atajos):**
- `PokeApp.tsx`: `useConnect` devuelve `data`/`loading`/`error` como 3 posiciones independientes de una tupla (convención fija: "tuplas con labels, no objetos" — ver sección Estado en `~/.claude/CLAUDE.md`), así que TS no puede correlacionarlas aunque en runtime sí lo estén (el reducer de `useStatus.ts` sí modela la correlación completa con una unión discriminada de 3 miembros, pero esa garantía se pierde al aplanar la tupla). Después de descartar `error` y `loading`, queda `data!.results` con un comentario explicando el invariante.
- `Unknown.tsx`: `ref.current!.value[0]` — `Unknown` solo se renderiza cuando el usuario ya escribió algo en el input (`data.results.length === 0`), así que `ref.current` nunca es null en ese punto, aunque el tipo de un `RefObject` sí lo permita.

## Tests

Vitest 3 + Testing Library + jsdom. 23 tests en 5 archivos, sin acceso a red.

```
src/tests/
  vitest.setup.ts               cleanups automáticos para toda la suite
  fixtures/pokeapi.ts           datos y URLs — fuente única de verdad
  fixtures/apiMock.ts           mockPages() y mockApiFailure()
  components/PokeApp.test.tsx   integración: las 4 ramas + interacción real
  components/Pokemon.test.tsx   derivación del id desde la url
  helpers/load.test.ts
  hooks/useConnect.test.ts
  hooks/useStatus.test.ts
```

**Decisiones fijas — no volver a preguntar:**
- Tests en `src/tests/` espejando `src/`, no junto al código.
- Config de Vitest en `vite.config.ts` (`defineConfig` de `vitest/config`), no `vitest.config.ts` aparte.
- El setup file se llama `vitest.setup.ts`, no `setup.ts` — más explícito sobre qué lo dispara al leer el árbol de `src/tests/`.
- Nombres estilo Vitest: `describe('useConnect')` + `it('comportamiento en minúscula')`, no `describe('Hook Testing')` + `test('Default Return Test')`.
- Solo se testea lo crítico: markup estático, mapeos simples y wrappers de una línea quedan cubiertos por el test de integración. Sin snapshots.
- `load.test.ts` no repite lo que ya cubre `useConnect.test.ts` (integra `load` real contra el mismo mock de axios). Se limita a lo que solo se observa aislado: cacheo en `localStorage` y que el cache evita refetch.
- `.ts` para tests sin JSX (`useConnect.test.ts`, `useStatus.test.ts`, `load.test.ts`, fixtures), `.tsx` solo si el test renderiza (`PokeApp.test.tsx`, `Pokemon.test.tsx`) — mismo criterio que el código de producción.

**Gotchas no obvios del setup:**
- `globals: false` → importar `describe/it/expect/vi` en cada archivo; Testing Library no auto-registra cleanup, `vitest.setup.ts` lo llama a mano.
- `restoreMocks: true` → cada test arma su propio escenario, sin default compartido.
- `vitest.setup.ts` también limpia `localStorage` (jsdom no lo hace solo; sin eso un test lee el cache del anterior).
- Mock de axios con factory explícita (`vi.mock('axios', () => ({ default: { get: vi.fn() } }))`), no automock.
- Fixtures de páginas son funciones, no objetos: `load` muta `data.results` in place, un objeto compartido a nivel módulo se corrompería entre tests.
- Queries por rol (`screen.getByRole`), nunca `container.querySelector`. `toHaveClass` está bien cuando la clase es el contrato del componente y ya se encontró por rol.
- `userEvent` (con `await` y `.setup()` antes del render), no `fireEvent`.

**Antes de dar un test por bueno:** romper a propósito la línea de producción que dice cubrir y confirmar que se pone rojo. La cobertura mide qué se ejecutó, no qué se verificó — el test viejo de `useConnect` tenía un `waitFor` sin `await`, pasaba en verde sin ejecutar ninguna aserción real.

**Scripts:** `npm test` es watch mode (cuelga en CI), `npm run test:run` es la corrida única, `npm run test:coverage` agrega cobertura vía `@vitest/coverage-v8`. Hoy da 96% de statements. `coverage/` está en `.gitignore` y también en `globalIgnores` de ESLint (si no, lintea el HTML/JS generado del reporte). `npm run typecheck` (`tsc -b`) es aparte de todo esto — cobertura mide qué corrió, no reemplaza el chequeo de tipos.

**Sin cobertura a propósito:** `App.tsx` (wrapper de una línea), `useStatus.ts` (`default: return state` del reducer, rama defensiva que nadie notaría si se rompiera).

## CI/CD

Dos workflows en `.github/workflows/`, separados porque disparan en eventos distintos:

- **`ci.yml`** — push a `development` (o manual). Job `test`: `npm ci` + `npm run typecheck` + `npm run lint` + `npm run test:run`. Job `open-pr`: si `test` pasó y no hay PR abierto, abre `development → main` con `gh pr create`.
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

- **Búsqueda: fetch y render de dataset completo sin paginar.** La PokeAPI no tiene endpoint de búsqueda por texto — `useConnect.ts` lo resuelve pidiendo la lista completa (`limit=100000`) y filtrando client-side. El resultado filtrado se renderiza entero en un `<ul>` sin paginar (`PokeList.tsx`), y cada tecla re-parsea/re-filtra ese JSON completo desde `localStorage`. Decisión tomada: virtualizar con **`@tanstack/react-virtual`** (headless, se acopla al layout flex-wrap actual sin forzar grid de columnas fijas; sucesor activo de `react-window`/`react-virtualized`, ambas en mantenimiento o abandonadas). Falta implementar.

## Accesibilidad — hecho

`aria-label` en el input de `Search.tsx`; `alt` por pokemon y `loading="lazy"` en `Pokemon.tsx`; `role="status"`/`aria-live` en `FakeList` y `Unknown.tsx`, `role="alert"` en `Error.tsx`; `disabled` real en `Button.tsx` además de la clase `inactive`.

**Ojo con `PokeList.css`:** en `Pokemon.tsx` el `h2` (nombre) va **antes** que el `img` y el `h3` (número) en el DOM, para que la jerarquía de headings no quede invertida. El orden *visual* de siempre (imagen arriba, nombre abajo) se mantiene con `order` en `.pokemon__img` / `.pokemon__name`. Si alguien reordena el JSX "para que coincida con lo que se ve", rompe la jerarquía otra vez.

Falta prueba manual con teclado y lector de pantalla: los scanners automáticos detectan entre un cuarto y un tercio de los problemas de WCAG.

## Decisiones fijas — no volver a preguntar (proyecto en general)

- **Sin `propTypes`.** React 19 eliminó su validación (verificado: `<Button />` sin sus props `isRequired` no emitía warning), así que era una dependencia inerte. Se sacó de todos los componentes y de `package.json` (ver sección TypeScript arriba para el reemplazo real: tipos estáticos, no runtime).
