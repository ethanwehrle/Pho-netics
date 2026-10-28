# Cue Card Site

A small Vietnamese language-practice site built with React. Practice sets are
defined in `data/metadata/sets.json` and populated by filtering the shared word
catalog in `data/master_words_list.json` by tag.

## Architecture

This is a client-side single-page application served and bundled by Vite:

- `index.html` provides the page shell and the `#root` element.
- `src/main.jsx` mounts the React app and loads the global stylesheets.
- `src/App.jsx` reads the set definitions and filters the master word list by
  each definition's `tagId` before rendering the practice-set grid.
- `src/theme.css` defines the color, typography, and other design tokens.
- `src/index.css` contains the global reset and page and card layout styles.
- `data/master_words_list.json` contains the shared vocabulary and its tags.
- `data/metadata/sets.json` defines the practice sets shown by the app. Each
  set has a `name`, `tagId`, `difficulty`, `description`, and `image` link.
- `public/images/` contains static assets served from the site root. The cards
  currently use `images/placeholder.svg`.
- `vite.config.js` configures Vite and its React plugin.

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

Generated build output (`dist/`), installed dependencies (`node_modules/`), and
environment files are excluded from version control.
