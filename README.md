# MFA Task Manager

Task manager for the Artefact practical case, built with Next.js 15, React, TypeScript, and tRPC.

## Setup

Requires Node.js 22+ and npm. No database or environment variables are needed.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3000.

To run the production build:

```sh
npm run build
npm start
```

## Features

- Create, edit, and delete tasks.
- Validate required titles and show errors from the API.
- Render the initial task list on the server, newest first.
- Load additional tasks using the Load more button (12 per page).
- Confirm deletion and show feedback after changes.

Task fields are `id`, `titulo`, `descricao`, and `dataCriacao`, following the case requirements. IDs are generated on the server; creation timestamps use Unix milliseconds.

## Structure

- `src/app`: routes, server rendering, and the tRPC HTTP handler.
- `src/tasks`: task pages, components, and helpers.
- `src/apis`: the tRPC client and request hooks.
- `src/global-components`: shared UI components.
- `src/models`: task types and validation.
- `src/server`: tRPC procedures and the in-memory store.

## Implementation notes

The list page calls the tRPC router on the server and passes its result to the client component. Browser mutations and pagination use the same router over HTTP.

Zod validation is shared between the form and API. Titles are trimmed and limited to 120 characters; descriptions are optional and limited to 2,000 characters.

Pagination uses an increasing sequence as a cursor, so deleting a task does not invalidate the next page. Dates are displayed in UTC to keep server and browser output consistent.

Form and request state use React hooks. Component styles use CSS Modules, with shared colors and spacing in global CSS.

## Limitations

Tasks are stored in memory and disappear when the server restarts. The app is intended to run in a single Node.js process; multiple instances would each have their own task list.

There is no authentication, so visitors share the same list. Persistent storage and user access controls would be needed for production use.

## Checks

```sh
npm test
npm run typecheck
npm run format:check
npm run build
```

Tests cover CRUD operations, validation, missing tasks, pagination, and the tRPC HTTP adapter.
