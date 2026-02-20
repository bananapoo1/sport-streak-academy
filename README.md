# Sport Streak Academy

A mobile-first training app focused on daily progress, streaks, challenges, and sport-specific drills.

## Local development

```sh
npm install
cp .env.example .env
npm run dev
```

## Scripts

- `npm run dev` — start development server
- `npm run build` — build production bundle
- `npm run lint` — run ESLint
- `npm run preview` — preview production build locally

## Release readiness (no Apple account required)

- Set production env values in `.env` (from `.env.example`)
- Keep `VITE_ENABLE_MOCK_API="false"` for release
- Run `npm run lint`, `npm run test`, `npm run build`
- Legal pages:
	- `/legal/privacy-policy.html`
	- `/legal/terms-of-service.html`
	- `/legal/account-deletion.html`
- See `RELEASE_RUNBOOK.md` for full checklist and rollback steps

## Tech stack

- React + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Supabase
