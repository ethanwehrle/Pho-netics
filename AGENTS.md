# Agent instructions

## Project conventions

- Keep changes focused on the requested behavior. Avoid unrelated refactors,
  speculative features, duplicate logic, and files that do not have a clear
  purpose. Reuse existing components, helpers, dependencies, and project
  structure.
- Preserve the current organization: route pages are in `src/Pages/`, reusable
  UI is in `src/components/`, and data preparation is in `src/data/`. Do not
  reorganize directories as part of an unrelated change.
- Use PascalCase for React component names and component filenames, camelCase
  for functions and JavaScript variables, and the existing BEM-style CSS class
  pattern (`block__element--modifier`).
- Treat `data/master_words_list.json` and `data/metadata/sets.json` as the
  vocabulary and set sources of truth. Preserve their existing field names,
  tag IDs, and data formats; do not add a parallel data source.
- Keep accessible semantics and keyboard behavior when changing interactive
  UI. Prefer native elements and follow existing component patterns.
- Do not edit generated output in `dist/` or installed packages in
  `node_modules/`.

## Validation

- Run `npm test` for changes to application logic, data, or UI behavior. Add
  focused Vitest tests for new behavior and data constraints.
- Run `npm run build` for application, styling, or data changes.
- Update directly related documentation when behavior, data formats, or setup
  instructions change. Do not create extra documentation or tooling without a
  concrete need.
