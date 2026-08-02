# School Portal

A small full-stack app for a private education business's administrators to register teachers and manage classes with form teachers.

- **Backend**: Node.js, Express, TypeScript, Prisma, PostgreSQL
- **Frontend**: React, TypeScript, Vite, shadcn/ui (Tailwind CSS), React Router
- **Repo layout**: npm workspaces monorepo — `server/` (API) and `client/` (web app)

## Hosted links

- **Web app**: https://school-portal-client.vercel.app/
- **API**: https://school-portal-api-jw92.onrender.com (health check at `/health`)

The API is hosted on Render's free tier, so the first request after a period of inactivity may take up to a minute while the instance spins back up.

## Prerequisites

- Node.js 20+ and npm 10+
- Docker (for a local PostgreSQL instance) — or any PostgreSQL 16 instance you already have running

## Running locally

1. **Start PostgreSQL**

   ```bash
   docker compose up -d
   ```

   This starts Postgres on `localhost:5433` (chosen instead of the default 5432 to avoid clashing with other local Postgres instances — see `docker-compose.yml`). If you already run Postgres locally and prefer to use it directly, skip this step and point `DATABASE_URL` (below) at your own instance instead.

2. **Install dependencies** (installs both `server` and `client` via npm workspaces)

   ```bash
   npm install
   ```

3. **Configure the API's environment**

   ```bash
   cp server/.env.example server/.env
   ```

   The defaults match the `docker-compose.yml` Postgres instance, so no edits are needed if you used step 1.

4. **Run database migrations**

   ```bash
   npm run prisma:migrate
   ```

5. **Start both dev servers**

   ```bash
   npm run dev
   ```

   - API: http://localhost:4000 (health check at `/health`)
   - Web app: http://localhost:5173 (proxies `/api/*` requests to the API in dev, see `client/vite.config.ts`)

   Or run them independently with `npm run dev:server` / `npm run dev:client`.

### Running tests

```bash
npm test
```

Runs the backend's vitest + supertest suite against the same Postgres instance from step 1 (each test resets the `classes`/`teachers` tables before it runs).

### Building for production

```bash
npm run build
```

Type-checks and compiles both workspaces (`server/dist` and `client/dist`).

## API

The brief specified four endpoints (`GET`/`POST` for teachers and classes); `GET /:id`, `PUT /:id`, and `DELETE /:id` were added beyond that spec to support the edit and delete flows in the UI.

| Method | Path                  | Description                                  |
| ------ | --------------------- | --------------------------------------------- |
| GET    | `/api/teachers`       | List all teachers                            |
| POST   | `/api/teachers`       | Register a teacher                           |
| GET    | `/api/teachers/:id`   | Get a single teacher                         |
| PUT    | `/api/teachers/:id`   | Update a teacher                             |
| DELETE | `/api/teachers/:id`   | Delete a teacher                             |
| GET    | `/api/classes`        | List all classes with form teacher           |
| POST   | `/api/classes`        | Create a class with a form teacher           |
| GET    | `/api/classes/:id`    | Get a single class                           |
| PUT    | `/api/classes/:id`    | Update a class (including its form teacher)  |
| DELETE | `/api/classes/:id`    | Delete a class                               |

All endpoints return errors as `{ "error": "message" }` with an appropriate HTTP status:

- `400` — validation errors
- `404` — the resource (or a referenced teacher, on `POST`/`PUT /api/classes`) doesn't exist
- `409` — conflicts: duplicate teacher email/contact number, a teacher already assigned as another class's form teacher, or deleting a teacher who's still a class's form teacher

Successful `GET`/`POST`/`PUT` requests return the resource as JSON; `DELETE` returns `204 No Content`. A Postman collection covering the success and error cases is included at [`postman_collection.json`](./postman_collection.json).

## Assumptions

Since login/access control was explicitly out of scope, there's no auth on any endpoint — anyone who can reach the API can call it. A couple of the linked Figma pages (particularly the "Field Types" screen for the class form) weren't accessible while building this, so the following were assumed instead:

- **Class `level`**: implemented as a fixed dropdown (Primary 1–6, Secondary 1–4) in the UI rather than free text, since it reads as a bounded set of options in the brief. The API itself accepts any non-empty string for `level` — it doesn't enforce this list server-side, since the assignment's API spec doesn't constrain it either.
- **Contact number**: validated server-side as an 8-digit SG mobile number (no symbols/spaces), based on the example values in the brief (e.g. `"68129414"`).
- **Duplicate teacher email/contact number**: both rejected with `409 Conflict` on create or update, since the brief doesn't say but treating them as unique identifiers felt like the safer interpretation for an admin system of record.
- **Form teacher exclusivity**: enforced both at the database level (a `UNIQUE` constraint on `Class.teacherId`) and in the service layer, so a teacher can't end up as the form teacher of two classes even under concurrent requests. This also applies when updating a class's form teacher.
- **`POST`/`PUT` response bodies**: the brief only specifies the success status code (201) for the two POST endpoints, not a response body. This implementation returns the created/updated resource (teacher or class) as JSON, following common REST convention.
- **Editing and deleting**: not in the original brief, but added since the linked Figma flows implied edit/delete affordances on the list screens. Deleting a teacher who's still a class's form teacher is rejected with `409 Conflict` rather than cascading, so an admin has to reassign or delete the class first.

## Known issues / not addressed

- `npm audit` flags a small number of vulnerabilities in transitive dev-only dependencies (Vite's dev-server-only esbuild advisory, and a React Router advisory specific to RSC/Next.js mode, which this plain Vite SPA doesn't use). Both require breaking major-version bumps to clear and don't affect this app's runtime behavior, so they were left as-is rather than force-upgraded.
