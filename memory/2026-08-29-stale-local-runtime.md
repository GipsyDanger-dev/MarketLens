# Stale local runtime after frontend changes

- **Symptom:** `http://localhost:3000/research/new` returned `500 Internal Server Error`; the homepage still showed the pre-redesign hero.
- **Root cause:** The embedded runtime was already running a previously built Next.js artifact. `marketlens up` intentionally treats a live process as already running and does not rebuild it.
- **Resolution:** Run `marketlens down`, then `marketlens up`. The embedded database directory is retained during this restart.
- **Verification:** `/`, `/research/new`, and `/api/health` all returned HTTP 200. The redesigned homepage marker was present and the old hero marker was absent.
