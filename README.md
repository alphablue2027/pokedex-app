# Pokedex Web App

Starter template to display Pokémon and filter them in a list.

[![React](https://img.shields.io/badge/React_19.1.1-blue)](https://reactjs.org/)
[![Jest DOM](https://img.shields.io/badge/Jest_DOM_6.9.1-darkred)](https://testing-library.com/docs/ecosystem-jest-dom/)
[![Axios](https://img.shields.io/badge/Axios_1.12.2-red)](https://axios-http.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript_6.0-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite_7.1.2-yellow)](https://vitejs.dev/)
[![Vite](https://img.shields.io/badge/Vitest_3.2.4-darkgreen)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/Polyform_Perimeter_License_1.0.0-red)](LICENSE)

## Preview

Live Link: [https://alphablue2027.github.io/pokedex-app/](https://alphablue2027.github.io/pokedex-app/)

## Project status

This project is under development. Listing, pagination, search and the loading, error and empty states are implemented and covered by tests. Performance work on the search results list and visual refinements are still pending — see the roadmap below.

## Description

`Pokedex Web App` is an application created to display Pokémon, enable filtering, and demonstrate componentization and state patterns in React. The code uses custom hooks over `useState` and `useReducer`, external API consumption, and unit and integration tests.

## Main features

- State management with `useState` and `useReducer` in custom hooks.
- REST API consumption to fetch Pokémon data, with responses cached in `localStorage`.
- Reusable components and testing for hooks and components.
- Responsive UI using CSS for different devices.
- Accessible markup: labelled search input, live regions for loading/error/empty states, real `disabled` on pagination.

## Technologies used

| Category | Technologies |
| :--- | :--- |
| Frontend & Language | React 19, TypeScript, Vite |
| State Management | useState, useReducer (custom hooks) |
| HTTP Client | Axios |
| Routing | No routing library included by default |
| Testing | Vitest, Testing Library |
| Style | CSS |
| Tools | ESLint, Vitest |
| Version Control | Git, GitHub |
| CI/CD | GitHub Actions |
| Deployment | GitHub Pages |

## Local installation and usage

Follow these steps to run the project on your machine.

### Prerequisites

- `Node.js` 22 (the version CI runs on)
- `npm`

### Steps

1. Clone the repository

    ```bash
    git clone https://github.com/alphablue2027/pokedex-app.git
    cd pokedex-app
    ```

2. Install dependencies

    ```bash
    npm install
    ```

3. Run in development mode

    ```bash
    npm run dev
    ```

### Run tests

```bash
npm test              # watch mode
npm run test:run      # single run
npm run test:coverage # single run with coverage report, used by CI
npm run typecheck     # tsc -b, used by CI
```

31 tests across 5 files, no network access.

## CI/CD

Two GitHub Actions workflows:

- **CI** runs on every push to `development`: type-check, lint, the full test suite with coverage thresholds, and a production build. If it passes, it opens a pull request to `main`.
- **Deploy** runs on every push to `main`: builds the project and publishes `dist/` to the `gh-pages` branch.

`main` is protected: changes land through a pull request with the `test` check passing. Merging the PR is manual.

## Roadmap (pending)

- Virtualize the search results list (`@tanstack/react-virtual`); the full dataset is currently fetched and rendered unpaginated.
- Manual accessibility testing with keyboard and screen reader.

## How to contribute

- Open an Issue to propose changes or report bugs.
- Create a Pull Request with one branch per feature/bugfix.
- Follow the existing code style and add tests when possible.

## Known issues

- Search fetches the entire Pokémon list and filters client-side; the filtered result renders unpaginated, which is slow on broad queries.

## License

This project is licensed under the [PolyForm Perimeter License 1.0.0](LICENSE).

### Key restrictions

- Free for **non-commercial** projects.
- **Prohibited** for use by businesses that compete with the owner.
- Contact the owner for commercial licenses.
