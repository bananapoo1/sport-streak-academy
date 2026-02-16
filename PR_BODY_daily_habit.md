# [Feature] Daily Card + Adaptive Drills + Progress + Completion Modal

## Summary
Implements the Daily Habit + Adaptive Drill Assignment feature behind feature flags with:
- Daily Home Card (one-tap start CTA)
- Animated ProgressRing (respects reduced motion)
- Completion modal with optional confetti
- Adaptive assignment engine with reinforcement behavior, novelty/exploration, and confidence-driven difficulty targeting
- Mock API contracts for web + minimal mobile-ready request/response surface
- Analytics instrumentation for assignment/session lifecycle
- Unit, integration, and e2e coverage

## Changes
### Product/UI
- Added Daily Home Card experience with assigned drill summary (home does not expose full catalog)
- Added one-tap CTA variants via feature-flag AB config
- Added ProgressRing SVG animation and reduced-motion handling
- Added Completion modal showing XP and streak updates with confetti gating

### Adaptive assignment
- Added scoring-based assignment using:
  - confidence-driven target difficulty
  - dynamic candidate window
  - proximity/novelty/failure/similarity weights
  - exploration epsilon
- Added struggle detection and reinforcement mode:
  - temporary target reduction
  - repeat queue for similar drills
  - reinforcement metadata in assignment response/events
- Supports large/unbounded drill pools through filtered/scored selection

### API contract stubs (mock)
- `GET /api/drills/assign?userId={id}&category={c}`
- `POST /api/drills/result`
- `POST /api/session/start`
- `POST /api/session/complete`

Mock server behavior includes:
- local persistence for confidence, attempt history, XP, streak, sessions
- server-authoritative XP clamping and level progression
- confidence update logic per outcome + reinforcement modifiers
- TODO annotation for production persistence/auth hardening

### Analytics + flags
- Events implemented: `home_daily_card_view`, `home_cta_click`, `drill_assigned`, `drill_attempt`, `drill_result`, `session_start`, `session_complete`, `xp_awarded`, `streak_extended`
- Flags implemented: `daily_card_v2`, `adaptive_assignment`, `celebration_confetti`, CTA variant split, reduce-motion default

## Testing
### Unit
- ProgressRing geometry and clamping
- Assignment algorithm behavior for:
  - Case A (high confidence)
  - Case B (low confidence + reinforcement)
  - Case C (exploration path)

### Integration
- assign -> session start -> session complete flow with XP/streak/confidence assertions

### E2E (Playwright)
- Home Daily Card starts session flow
- Low-confidence struggle path triggers reinforcement and subsequent improvement trend

### Executed locally
- `npm run test` ✅
- `npm run build` ✅
- `npm run test:e2e` ✅ (2 passed)

## Rollout plan
- Keep behind `daily_card_v2` + `adaptive_assignment`
- Monitor assignment and session events (especially reinforcement rate, confidence trend, XP distribution)
- Tune constants in adaptive config without changing API surface

## Notes
- This branch intentionally includes only the new daily-habit/adaptive-assignment commits; unrelated local workspace edits remain uncommitted.
- Story file included for DailyCard component consumption in Storybook-enabled environments.
