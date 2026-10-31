# Cue Card Site

A small Vietnamese language-practice site built with React. Practice sets are
defined in `data/metadata/sets.json` and populated by filtering the shared word
catalog in `data/master_words_list.json` by tag.

## Architecture

This is a client-side single-page application served and bundled by Vite:

- `index.html` provides the page shell and the `#root` element.
- `src/main.jsx` mounts the React app and loads the global stylesheets.
- `src/App.jsx` coordinates the page routes and shared preferences using
  React Router.
- `src/data/practiceSets.js` indexes the master word list by tag and creates
  the practice sets from their definitions in one pass.
- [`docs/PROJECT_GUIDE.md`](./docs/PROJECT_GUIDE.md) is a beginner-focused,
  in-depth walkthrough of the React app, its files, data flow, and build
  process.
- `src/theme.css` defines the color, typography, and other design tokens.
- `src/index.css` contains the global reset and page and card layout styles.
- `data/master_words_list.json` is the vocabulary source loaded by the app.
- `data/master_words_list.csv` is not loaded by the app; keep it synchronized
  with the JSON file if it is maintained as an export.
- `data/metadata/sets.json` defines the practice sets shown by the app. Each
  set has a `name`, `tagId`, `difficulty`, `description`, and `image` link.
- `public/images/` contains static assets served from the site root. The cards
  use the image configured in each set definition, falling back to
  `images/placeholder.svg` when no image is configured.
- `vite.config.js` configures Vite and its React plugin.

The app uses browser-history URLs: `/` for the home page and
`/practice/<set-id>?language=english` (or `vietnamese`) for practice. Production
hosting must serve `index.html` for unknown paths so direct links and refreshes
on client-side routes reach the app.

The app creates a practice set by selecting master-list entries whose `tags`
array includes the set's `tagId`. Add a set definition to `sets.json` to add
another list, and tag matching entries in the master word list. Word records
use an `id`, `vietnamese`, `english`, and `tags` field, for example:

```json
[
  {
    "id": "000001",
    "vietnamese": "xin chào",
    "english": "hello",
    "tags": ["top_1000_words"]
  }
]
```

Set definitions use this shape:

```json
[
  {
    "name": "Top 1000 Vietnamese Words",
    "tagId": "top_1000_words",
    "difficulty": "easy",
    "description": "Practice high-frequency Vietnamese words.",
    "image": "/images/pexels-nguyendesigner-11017986.jpg"
  }
]
```

## Dependencies

The project uses:

- **React** and **React DOM** for the user interface.
- **React Router** for browser-history navigation and page routes.
- **Vite** for the development server and production build.
- **`@vitejs/plugin-react`** to support React in Vite.

Install Node.js with npm included before setting up the project. The exact
dependency versions are recorded in `package-lock.json`; use `npm ci` to
install those locked versions.

## Development setup

1. Install Node.js (which includes npm).
2. Open a terminal in the project directory.
3. Install dependencies:

   ```sh
   npm ci
   ```

4. Start the development server:

   ```sh
   npm run dev
   ```

   To bind the server to this computer only, use:

   ```sh
   npm run start:local
   ```

5. Open the local URL printed by Vite in your browser. The default is
   `http://localhost:5173/`. Press **Ctrl+C** in the terminal to stop the
   server.

On Windows, you can instead double-click [`start-local.bat`](./start-local.bat).
It checks for Node.js and npm, runs `npm ci` if dependencies are not installed,
and then starts the local-only development server.

## Available commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run start:local` | Start the server bound to `127.0.0.1`. |
| `npm run build` | Create the production build in `dist/`. |
| `npm run preview` | Preview the production build locally after running the build. |
| `npm test` | Run the built-in Node.js tests for practice-set data preparation. |

Generated build output (`dist/`), installed dependencies (`node_modules/`), and
environment files are excluded from version control.
