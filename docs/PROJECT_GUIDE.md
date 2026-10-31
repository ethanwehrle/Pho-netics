# Phở-netics: A Guided Tour of the Code

This guide explains how the site is put together for someone who is new to
React. It starts with the big picture, follows the code from the browser entry
point through the main user flows, then walks through the files and shows how
to extend the app.

You do not need to memorize every file before changing anything. A useful
starting path is:

1. Read [How the site runs](#how-the-site-runs).
2. Follow [The first page load](#the-first-page-load).
3. Follow [The practice flow](#the-practice-flow).
4. Use [A file-by-file tour](#a-file-by-file-tour) as a reference.

## What this project does

Phở-netics is a client-side website for practicing Vietnamese vocabulary with
flashcards. It has a home page containing practice-set cards, a dialog for
choosing a practice direction, a flashcard session, and a settings dialog for
the color theme.

The site is a **single-page application** (SPA). The browser first downloads a
small HTML page and JavaScript bundle. React then renders the interface and
updates parts of that interface as the user interacts with it. When a user
navigates between pages, React Router changes the browser URL and selects a
different React page without requesting a complete new HTML document.

The app's vocabulary and set definitions are bundled from local JSON files.
There is no server API, account system, or database in this project. The
browser's `localStorage` remembers the theme and the overall review counter on
that browser.

## How the site runs

The development and production pipeline is:

```text
index.html
    ↓ loads
src/main.jsx
    ↓ mounts
<BrowserRouter><App /></BrowserRouter>
    ↓ matches a route and renders page components
React components + JSON data
    ↓ styled by
src/theme.css + src/index.css
```

In development, Vite serves the source files and transforms JSX as the browser
requests them. For production, Vite bundles the JavaScript, CSS, and static
assets into `dist/`. The deployment host serves those generated files.

### Important terms

- **React component:** A JavaScript function that returns a description of UI
  using JSX. For example, `SiteHeader` describes the header.
- **JSX:** JavaScript syntax that looks like HTML. `{someValue}` inserts a
  JavaScript expression into JSX.
- **Props:** Values passed from one component to another. `App` passes the
  selected practice set into `SetDialog` as a prop.
- **State:** Values that can change while the app runs. React's `useState`
  stores values such as the active theme and current flashcard.
- **Render:** React calling a component to produce its current UI. When state
  changes, React renders again and updates the parts of the page that changed.
- **Event handler:** A function that runs in response to an action such as a
  click or a text input change.
- **Hook:** A React function such as `useState` or `useEffect` that lets a
  component use state or synchronize with something outside React.
- **Route:** A URL pattern mapped to a page. `/practice/:setId` is a route whose
  `:setId` part varies.

## The first page load

### 1. `index.html` gives the browser a page shell

[index.html](../index.html) is the HTML document Vite serves. It declares the
document language, character encoding, viewport, title, and one empty element:

```html
<div id="root"></div>
```

React takes over that `root` element. The HTML does not contain the practice
cards itself; React creates them after the JavaScript runs.

The page also loads `/src/main.jsx` as a JavaScript module. The leading slash
means the path is served from the site's root by Vite.

### 2. `src/main.jsx` starts React

[main.jsx](../src/main.jsx) is the JavaScript entry point:

1. `createRoot` tells React which DOM element it owns.
2. `<StrictMode>` enables extra development checks that can help expose
   lifecycle mistakes. It does not add visible UI.
3. `<BrowserRouter>` makes browser-history routing available to components
   below it.
4. `<App />` is the root application component.
5. The theme and global stylesheets are imported so Vite includes them.

`BrowserRouter` must be above components that use React Router hooks such as
`useNavigate`, `useParams`, or `useSearchParams`. Those hooks read the router's
context, which is provided by `BrowserRouter`.

### 3. `App` builds the shared application shell

[App.jsx](../src/App.jsx) renders the parts shared by all pages:

- `SiteHeader`
- `SiteSidebar`
- The `<main>` containing the route-selected page
- `SetDialog`

The header and dialogs are outside the route elements, so they remain mounted
when the route changes. The content inside `<Routes>` changes based on the URL.

At module load, `App.jsx` imports both JSON files and calls
`createPracticeSets`. That gives the app a ready-to-use list of practice sets
before the first render.

## Routes and browser URLs

The router is configured in `App.jsx`:

| URL | Result |
| --- | --- |
| `/` | Home page and practice-set grid |
| `/practice/top_100_words?language=english` | English-first session for that set |
| `/practice/top_100_words?language=vietnamese` | Vietnamese-first session for that set |
| Any unmatched URL | Page-not-found content |

The current `/practice/:setId` route includes a `language` query parameter.
React Router's `useParams()` reads the route segment (`setId`); its
`useSearchParams()` reads the query parameter (`language`).

`PracticeRoute` looks up the set by its ID and checks that the language is one
of the supported values, `english` or `vietnamese`. If either is invalid, it
renders `NotFoundPage`. This prevents a malformed URL from starting a session
with missing data.

`startPractice` uses `useNavigate()` to navigate to a practice URL after the
user chooses a language in the set dialog. `Link` components are used for
in-app Home links. These are client-side navigations, not full-page reloads.

### Browser-history hosting requirement

Because `BrowserRouter` uses ordinary paths instead of hash fragments, the web
host must return `index.html` for a client-side route that it does not recognize
as a physical file. That is commonly called a **history fallback** or
**SPA fallback**. Vite's development server handles this during local
development. A production host needs the equivalent rewrite/fallback rule;
otherwise visiting or refreshing a URL such as
`/practice/top_100_words?language=english` could return a server 404 before
React Router gets a chance to run.

## Data: words and practice sets

### Vocabulary records

[master_words_list.json](../data/master_words_list.json) is the vocabulary
catalog imported by the app. A word record has this shape:

```json
{
  "id": "000001",
  "vietnamese": "xin chào",
  "english": "hello",
  "tags": ["top_1000_words", "greetings"]
}
```

- `id` uniquely identifies a word and is used by React and the session to
  recognize the same word.
- `vietnamese` is its Vietnamese text.
- `english` is its English translation.
- `tags` lists the practice sets that contain the word. One word can appear in
  multiple sets.

The current catalog contains 1,000 records. The app reads the JSON file at
build time through a JavaScript import; it does not fetch the file over HTTP
when a user opens the site.

### Set definitions

[sets.json](../data/metadata/sets.json) describes which sets are visible:

```json
{
  "name": "Top 100 Vietnamese Words",
  "tagId": "top_100_words",
  "difficulty": "easy",
  "description": "Practice the 100 highest-frequency Vietnamese words.",
  "image": "/images/pexels-nguyendesigner-11017986.jpg"
}
```

- `name` is displayed in the grid and dialog.
- `tagId` connects this definition to words' `tags`.
- `difficulty` is used by the home-page difficulty filters.
- `description` is shown on the card and in the dialog.
- `image` is the image URL used for the card. If it is absent or empty,
  `createPracticeSets` uses `/images/placeholder.svg`.

The set ID used in the URL is also the set's `tagId`. Therefore each definition
needs a unique, URL-safe `tagId`; vocabulary tags must use the exact same value.

### `createPracticeSets`

[practiceSets.js](../src/data/practiceSets.js) contains the data-preparation
function `createPracticeSets(setDefinitions, masterWords)`.

It works in two passes:

1. It loops through every word and each of that word's tags, building a
   `Map` from tag ID to an array of matching word records.
2. It loops through the set definitions and returns a set object for each one,
   taking the words from the map for that definition's tag.

The returned objects contain the original display fields plus:

- `id`, copied from `tagId`, for React keys and route matching.
- `words`, the complete matching word records.
- `image`, guaranteed to have either the configured image or a placeholder.

This indexing approach avoids scanning all words from the beginning for every
set. Its work is proportional to the number of word-tag relationships plus the
number of set definitions, rather than doing a complete word-list scan for
each set.

[practiceSets.test.js](../tests/practiceSets.test.js) tests this function
without rendering React. It verifies tag matching and order, the fallback
image, and the empty-word-list case.

### The CSV file

[master_words_list.csv](../data/master_words_list.csv) is present as a data
export, but the React app imports the JSON file, not the CSV. Editing the CSV
alone does not change the site's vocabulary. If both files are intended to
represent the same catalog, changes must be synchronized or a conversion
workflow must be added.

## The practice flow

This is the path from selecting a set to reviewing a word:

1. `HomePage` receives the prepared, filtered set list from `App`.
2. It renders a `PracticeSetCard` for each set.
3. Clicking a card calls its `onSelect` prop with that set.
4. `App` stores the selected set in `selectedSet` state.
5. `SetDialog` receives that value and opens the native HTML dialog.
6. Choosing English or Vietnamese calls `startPractice(language)`.
7. `startPractice` navigates to `/practice/<setId>?language=<language>`.
8. `PracticeRoute` resolves the URL values and renders `PracticeSession`.
9. `PracticeSession` shuffles the set's words and manages the current card.
10. When the user reveals a word's other side for the first time in that
    session, the session reports the review to `App`.
11. `App` increments the global review count and stores it in `localStorage`.

### React state and ownership

State belongs to the component that owns it. A child receives the values it
needs through props and can request changes by calling callback props.

| State | Owner | Purpose |
| --- | --- | --- |
| Selected practice set | `App` | Determines whether the set dialog is open and what it displays |
| Sidebar open/closed | `App` | Controls the settings dialog |
| Selected difficulties | `App` | Controls which sets pass the difficulty filter |
| Search query | `App` | Controls the home-page search and visible results |
| Reviewed-card total | `App` | Shared count displayed in the header and persisted across reloads |
| Theme | `App` | Controls the document's `data-theme` attribute and persisted preference |
| Shuffled deck | `PracticeSession` | Keeps the randomized order for this practice session |
| Current position | `PracticeSession` | Selects the current card and completion state |
| Flipped state | `PracticeSession` | Chooses which language side is visible |
| Reviewed word IDs | `PracticeSession` | Prevents a word being counted twice in one session |

The home-page search and filter controls are examples of **controlled inputs**:
their current values come from React state, and their change handlers ask
`App` to update that state. React then renders the results using the new values.

## File-by-file tour

### Project root

#### `index.html`

The browser document shell. It defines metadata, the title and the `#root`
mount point, then loads `src/main.jsx`. Most application UI belongs in React
components rather than directly in this file.

#### `package.json`

The project manifest:

- `dependencies` lists packages required by the running app: React,
  React DOM, and React Router.
- `devDependencies` lists Vite and its React plugin.
- `scripts` gives short names to common commands:
  - `npm run dev`: start Vite's development server.
  - `npm run start:local`: start Vite bound only to `127.0.0.1`.
  - `npm run build`: generate the production bundle in `dist/`.
  - `npm run preview`: serve the most recent production build locally.
  - `npm test`: run Node's built-in test runner.

#### `package-lock.json`

Records the exact dependency tree npm resolved. `npm ci` uses this lockfile to
install repeatable versions. When adding or upgrading a dependency, let npm
update this file; do not hand-edit dependency resolutions.

#### `vite.config.js`

Configures Vite and registers `@vitejs/plugin-react`, which provides Vite's
React/JSX support.

#### `.gitignore`

Lists generated or local-only files that Git should not track, including
`node_modules/`, `dist/`, and `.env*` files. Environment files can contain
machine-specific configuration or secrets, so they should not be committed.

#### `start-local.bat`

A Windows helper for starting the local development server. It changes to the
project directory, checks that Node.js and npm are available, runs `npm ci` if
Vite is not installed yet, and starts the `start:local` script. The equivalent
manual steps are listed in the README.

#### `LICENSE`

Project licensing terms. It is not part of the React runtime.

#### `README.md`

The short project overview: setup steps, architecture summary, route behavior,
and available npm commands. It links to this guide for the longer explanation.

#### `docs/PROJECT_GUIDE.md`

This document. It expands the README's quick overview into a beginner-oriented
walkthrough of the app's files, state and data flow, routes, and extension
patterns.

### `src/`: application code

#### `src/main.jsx`

Bootstraps React. It imports the root component and styles, creates a React
root, then renders `App` inside `StrictMode` and `BrowserRouter`.

#### `src/App.jsx`

The top-level coordinator. It imports the JSON data and shared components,
prepares the practice sets, owns app-wide state, configures the routes, and
connects child callbacks to state updates.

**Module-level values**

- `practiceSets`: the prepared set objects produced by
  `createPracticeSets`.
- `difficultyLevels`: the allowed filter labels (`easy`, `medium`, `hard`).
- `reviewCountStorageKey` and `themeStorageKey`: names used for browser storage.

**Functions**

- `readReviewedCardCount()`: reads and parses the saved count. It accepts only
  a non-negative safe integer; malformed or unavailable storage falls back to
  zero and logs a warning.
- `readSavedTheme()`: reads the stored theme, accepting `dark` and otherwise
  using `light`. Storage failures also log a warning.
- `PracticeRoute({ onCardReviewed })`: reads the route's `setId` and language,
  finds the set, validates the language and either renders
  `PracticeSession` or `NotFoundPage`.
- `NotFoundPage()`: renders a friendly message and an in-app link back home.
- `App()`: stores shared state, filters the set list, applies the theme,
  records reviews, toggles difficulty values, and renders the shared shell and
  routes.

**Hooks and handlers in `App`**

- `useNavigate()` supplies the `navigate` function for programmatic route
  changes.
- `useState()` stores the selected set, dialog state, filters, search text,
  review total, and theme.
- `useEffect()` synchronizes the theme state with the document root and
  persists it in `localStorage`. An effect is appropriate here because the
  document and browser storage are outside React's render tree.
- `startPractice(language)` navigates to the selected set's practice URL and
  clears the selected set so the dialog closes.
- `recordCardReview()` increments the global count and writes the new count.
- `toggleDifficulty(difficulty)` copies the current `Set`, adds or removes the
  difficulty, then returns the new set. State collections should be replaced
  with new objects rather than mutated in place so React can detect the change.

**Filtering**

`filteredPracticeSets` is calculated from `practiceSets` on each render. A set
is visible if it matches the current search text and either no difficulty
filter is selected or its difficulty is selected. With only seven current
sets, recalculating this small list is simple and does not need memoization.

#### `src/components/homePage.jsx`

Renders the home page's heading, search field, difficulty buttons, set grid,
and no-results message. It does not own those values: `App` passes them as
props. Each difficulty button reports a click through `onToggleDifficulty`;
the search field reports its new text through `onSearchQueryChange`.

The filename currently uses a lowercase `h`. Import paths must use the exact
filename casing, especially for deployments on case-sensitive filesystems.

#### `src/components/PracticeSetCard.jsx`

Renders one set's name, word count, difficulty, image, and description.
`onSelect(set)` is called when its full-card button is activated. The button
uses the accessible name and description from the neighboring text. The
description overlay is shown on hover, keyboard focus, and touch-capable
devices (CSS handles those presentation details).

#### `src/components/SetDialog.jsx`

Shows the selected set's description and word count in a native `<dialog>`.
`useRef()` stores a reference to the actual DOM dialog; `useEffect()` calls
`showModal()` or `close()` when the `set` prop changes. The language buttons
call `onStartPractice`, while Cancel, Escape, and the dialog's close event
call `onClose`. If the set is empty, the dialog explains that there are no
words instead of offering a practice action.

#### `src/components/PracticeSession.jsx`

Runs one flashcard session. It receives a set, a starting language, and a
callback for recording reviews.

**`shuffleWords(words)`**

Copies the input array, then uses the Fisher–Yates shuffle: from the end of the
array to the beginning, it picks a random position among the not-yet-fixed
positions and swaps the two entries. Copying first ensures the original set's
word order is not changed.

**Session state**

- `deck`: the shuffled word list.
- `position`: the index of the word being displayed. When it reaches
  `deck.length`, the session is complete.
- `isFlipped`: whether the translated side is shown.
- `reviewedWordIds`: a `Set` of word IDs already counted during this session.

The lazy initializer form `useState(() => shuffleWords(set.words))` runs the
shuffle when the session is initialized, not on every render. The `key` on the
session in `PracticeRoute` makes React create a fresh session when the set or
language changes.

**Session handlers**

- `markWordReviewed(reviewedWord)`: adds a word ID if it has not already been
  counted and tells `App` to increment the persistent total.
- `goForward()`: flips the current card and marks it reviewed, or advances to
  the next word if already flipped.
- `goBack()`: turns a flipped card back to its first side, or goes to the
  previous card. It handles returning from the completion screen as well.
- `restartPractice()`: shuffles a fresh deck and resets the position, flip,
  and per-session reviewed-ID set.

When `position` points at a word, the component renders the card faces,
progress, and navigation controls. When the deck is empty, it shows the
empty-set message. When the position reaches the deck length, it shows a
completion screen with Home and Practice again actions.

`Link` is used for Home navigation so the browser URL changes through React
Router without reloading the application.

#### `src/components/SiteHeader.jsx`

Renders the brand, the persistent review counter, and the menu button. It does
not calculate the count or open settings itself; `App` provides those values
and the `onOpenSidebar` callback. The brand is the page's main `<h1>`.

#### `src/components/SiteSidebar.jsx`

Implements the appearance settings as a native modal dialog styled as a
right-side panel. `isOpen` is a prop controlled by `App`; a `useEffect()` keeps
the native dialog's open state aligned with that prop.

The dialog can be closed by its close button, Escape, or clicking the backdrop.
The theme is a pair of radio inputs. Selecting one calls `onThemeChange`, which
updates the theme state in `App`.

Its small event handlers each handle a different native-dialog event:

- `handleBackdropClick(event)` closes only when the click target is the dialog
  backdrop, not when it is inside the panel.
- `handleKeyDown(event)` intercepts Escape and asks the parent to close.
- `handleCancel(event)` prevents the browser from changing dialog state behind
  React's back and instead asks the parent to update `isOpen`.

#### `src/theme.css`

Defines CSS custom properties (variables) for colors and typography. The
default `:root` values are the light theme. The selector
`:root[data-theme='dark']` overrides the same variables when `App` sets the
document element's `data-theme` attribute to `dark`.

Components use variables such as `var(--color-surface)` instead of repeating
literal colors. This keeps light and dark styling coordinated.

#### `src/index.css`

Contains the global reset and component presentation rules. Sections cover:

- Global box sizing, root dimensions, page and header layout.
- Header actions, settings sidebar, and theme controls.
- Home page layout, search, difficulty filters, and responsive set grid.
- Set cards, image sizing, description overlay, and keyboard focus.
- The set dialog and its language/cancel buttons.
- Flashcard dimensions, 3D flip, navigation targets, and progress.
- Practice completion and empty-set layouts.
- Touch-device overlay behavior and reduced-motion preferences.

Class names follow a component-oriented naming pattern such as
`.practice-set-card__title`. The `__` portion groups an element with its
component block; a modifier such as `--flipped` represents a visual state.
React changes the class when state changes, and CSS supplies the corresponding
appearance.

### `data/`: content

- `data/master_words_list.json`: vocabulary imported by the React app.
- `data/metadata/sets.json`: set metadata and tag IDs.
- `data/master_words_list.csv`: CSV export, not currently imported by the app.

The data files are content, not React components. Their shape is important:
the app expects each word's `tags` to be an array, and each set's `tagId` to
match those tag values.

### `public/`: static assets

Files in `public/` are copied or served as static files rather than imported
through JavaScript.

- `public/images/pexels-nguyendesigner-11017986.jpg`: configured card image.
- `public/images/placeholder.svg`: fallback card image.

Their browser paths omit the `public` directory: the JPEG is addressed as
`/images/pexels-nguyendesigner-11017986.jpg`.

### `tests/`: automated checks

`tests/practiceSets.test.js` uses Node's built-in `node:test` and
`node:assert/strict` modules. The tests exercise the standalone data helper,
which keeps them fast and avoids needing to launch a browser or render React.
Run them with:

```sh
npm test
```

The suite currently covers data preparation. It does not yet include
component-level or browser interaction tests.

### `dist/`: generated output

`dist/` is Vite's production output and is ignored by Git. It contains compiled
and bundled files, not the source of truth. Do not edit it to make an app
change; update `src/`, `data/`, or `public/`, then run the build again.

## How styling and accessibility work together

React components provide semantic HTML and state-dependent attributes. CSS
controls layout, colors, focus indication, and animation.

Some examples:

- A button uses `aria-pressed` to communicate whether a difficulty filter is
  selected, in addition to its visual selected style.
- The practice set dialog and sidebar have labels linked to their headings.
- Focus-visible outlines make keyboard focus easier to see.
- The description overlay appears when the card is hovered or contains keyboard
  focus, and is always visible on devices without hover.
- `prefers-reduced-motion` disables decorative transitions for people who have
  requested reduced motion.
- Language text uses the `lang` attribute so assistive technologies can use
  the appropriate pronunciation rules.

When adding an interactive control, prefer a native `<button>`, `<a>`, form
input, or dialog before recreating that behavior with a generic `<div>`.

## Browser storage

`App.jsx` uses two local-storage keys:

- `cue-card-site-theme`: the string `light` or `dark`.
- `cue-card-site-stats`: a JSON object such as
  `{"cardsReviewed": 6}`.

The read helpers validate stored data and provide a safe default if browser
storage is unavailable or malformed. Writes are wrapped too; a storage failure
is logged but does not stop the practice UI from working for the current page
load.

`localStorage` belongs to the browser and origin. It is not synchronized to
another browser, device, or user account.

## Adding content and features

### Add vocabulary to a set

1. Add or edit a record in `data/master_words_list.json`.
2. Give it a unique `id`, Vietnamese and English strings, and a `tags` array.
3. Add the set's existing `tagId` to `tags` to include the word in that set.
4. If the CSV is maintained as a matching export, update it as well.
5. Run `npm test` and `npm run build`.

### Add a practice set

1. Add a definition to `data/metadata/sets.json`.
2. Give it a unique `tagId`, name, difficulty, description, and optional image.
3. Add that tag to each vocabulary record that belongs to the new set.
4. `createPracticeSets` automatically creates the set from the shared data.
5. The existing home page will display it; no per-set JSX is needed.

An empty set is allowed in the current data flow, but its dialog will not show
language buttons and the practice page has a return-home message.

### Add a page

1. Create a component under `src/components/` that renders the new page.
2. Import it in `src/App.jsx`.
3. Add a `<Route path="..." element={<YourPage />} />` inside `<Routes>`.
4. Use `<Link to="...">` for in-app links, or `useNavigate()` for a navigation
   caused by an action.
5. Keep shared state in `App` only when multiple routes or components need it;
   keep page-specific state inside the page component.
6. Add a browser-hosting fallback for the new route if the deployment host
   requires explicit SPA rewrites.
7. Add tests for non-visual logic and browser tests for important user flows
   when appropriate.

### Add a component or interaction

Start by identifying who owns the data. A common pattern is:

```jsx
function Parent() {
  const [value, setValue] = useState('');

  return <Child value={value} onValueChange={setValue} />;
}

function Child({ value, onValueChange }) {
  return (
    <input
      value={value}
      onChange={(event) => onValueChange(event.target.value)}
    />
  );
}
```

The parent owns the state; the child displays it and reports user input. This
keeps one source of truth instead of maintaining two competing copies.

## Running and building the project

### First-time setup

Install Node.js (which includes npm), open a terminal in the project directory,
then install the exact locked dependencies:

```sh
npm ci
```

### Development

```sh
npm run dev
```

Vite prints a local URL, usually `http://localhost:5173/`. Changes to source
files are reflected by its development server without manually rebuilding.

On Windows, `start-local.bat` starts the server bound to the local machine.

### Tests

```sh
npm test
```

This runs the Node.js test files matched by the built-in test runner.

### Production build and preview

```sh
npm run build
npm run preview
```

The build command creates `dist/`. Preview serves that built output locally so
you can inspect the production version before deployment.

## Practical mental model

When debugging or planning a change, trace data and events in this order:

1. **Where does the value originate?** It may come from JSON, the URL, browser
   storage, or a component's state.
2. **Who owns the value?** Look for the `useState` call or the data helper.
3. **Which component displays it?** Follow the props passed from the owner.
4. **What event changes it?** Find the event handler passed to `onClick`,
   `onChange`, or another event prop.
5. **How is the new state persisted or routed?** Check `localStorage`,
   `navigate`, or a React Router `Link`.
6. **Which CSS selector styles it?** Search for the component's class name in
   `src/index.css` or the token in `src/theme.css`.

For example, to trace the theme picker: the radio input is in
`SiteSidebar`; it calls `onThemeChange`; `App` updates `theme`; the effect in
`App` writes the theme to the document and local storage; CSS variables in
`theme.css` change appearance.

That data-flow view is the key to understanding most React features in this
project: **data is rendered into components, events request state changes, and
React renders the updated result.**
