# Football Drill Blueprint Implementation Plan

## Overview
Import 150 football drills from JSON, persist in DB, and create authoritative server-side logic for drill completion, unlocking, and challenges.

---

## Phase 1: Database Schema & Migration

### 1.1 Create `drills` Table
```sql
CREATE TABLE IF NOT EXISTS public.drills (
  id text PRIMARY KEY,
  sport text NOT NULL,
  category text NOT NULL,
  category_name text,
  level int NOT NULL,
  title text NOT NULL,
  description text,
  duration_minutes int NOT NULL DEFAULT 7,
  solo_or_duo text DEFAULT 'solo',
  equipment jsonb DEFAULT '[]'::jsonb,
  steps jsonb DEFAULT '[]'::jsonb,
  metric jsonb DEFAULT '{}'::jsonb,
  xp int NOT NULL DEFAULT 30,
  free boolean DEFAULT false,
  unlock_requires text DEFAULT 'none',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### 1.2 Create `drill_categories` Table
```sql
CREATE TABLE IF NOT EXISTS public.drill_categories (
  id text PRIMARY KEY,
  sport text NOT NULL,
  name text NOT NULL,
  levels int NOT NULL DEFAULT 10,
  drills_per_level int NOT NULL DEFAULT 3,
  created_at timestamptz DEFAULT now()
);
```

### 1.3 Update `completed_drills` Table
Add `score_data jsonb` column for metric-based scoring.

### 1.4 Add Unique Constraint to `daily_progress`
```sql
ALTER TABLE daily_progress ADD CONSTRAINT daily_progress_user_date_unique UNIQUE (user_id, date);
```

### 1.5 RLS Policies
- `drills`: Public read access (SELECT for all)
- `drill_categories`: Public read access

### 1.6 Idempotent Upsert Migration
Insert all 150 drills from JSON using `ON CONFLICT (id) DO UPDATE`.

---

## Phase 2: Shared Constants

### 2.1 Create `src/lib/constants.ts`
```typescript
export const DAILY_GOAL_MINUTES = 30;
export const FREE_DRILL_LIMIT_PER_DAY = 1;
export const XP_MULTIPLIER = 1; // Applied to drill.xp
```

### 2.2 Edge Function Constants
Mirror constants in edge functions (or fetch from DB config table if needed later).

---

## Phase 3: Edge Functions

### 3.1 Rewrite `complete-drill` Edge Function

**Inputs:**
```typescript
{
  drill_id: string;
  duration_minutes?: number; // Optional override
  score_data?: object;       // For metric-based drills
  challenge_id?: string;     // If completing as part of challenge
}
```

**Logic Flow:**
1. Authenticate user
2. Fetch drill from `drills` table (validate exists)
3. Check subscription status (Free/SingleSport/Pro)
4. **Free user checks:**
   - Count today's completed drills < FREE_DRILL_LIMIT_PER_DAY
   - Only level 1 drills allowed (unless unlock_requires met)
5. **Unlock validation:**
   - If `unlock_requires = "complete_any_in_category_level_N"`, verify user has completed any drill in that category at level N
   - If `unlock_requires = "none"`, allow
6. **Challenge detection:**
   - If `challenge_id` provided OR active accepted challenge exists for this drill
   - Submit score to challenge (don't insert to completed_drills for tree progression)
   - Update daily_progress (challenge drills count toward daily limits)
7. **Regular drill path:**
   - Idempotent insert to `completed_drills`
   - Upsert `daily_progress`
   - Update `profiles.total_xp`, streak logic
8. **Response:**
   ```typescript
   {
     success: true,
     earned_xp: number,
     new_total_xp: number,
     day_minutes: number,
     unlocked_new_drills: string[], // IDs of newly unlockable drills
     challenge_submitted: boolean,
     already_completed: boolean
   }
   ```

### 3.2 Update `submit-challenge-score` Edge Function
- Accept `{ challenge_id, user_id, score, score_data? }`
- Update `challenger_score` or `challenged_score`
- If both scores present: determine winner, set status = 'completed', award XP bonus

### 3.3 Create API Edge Functions

**`get-drills`:**
- Query params: `sport`, `category`, `level`
- Returns drills with computed `unlock_status` for current user
- Joins with `completed_drills` to show completion status

**`get-drill`:**
- Path: `/:id`
- Returns full drill detail including unlock_requires

**`get-categories`:**
- Query params: `sport`
- Returns categories with level map

**`get-user-completed-drills`:**
- Query params: `date` (optional)
- Returns user's completed drills

---

## Phase 4: Client Updates

### 4.1 Update `drillsData.ts` Usage
- Replace hardcoded drills with API fetch
- Create `useDrills` hook to fetch from DB
- Keep local data as fallback/cache

### 4.2 Update Drill Components
- Fetch drills from API
- Use server-computed unlock_status for UI
- Pass `drill_id` (new format) to complete-drill

### 4.3 Update `useProgress` Hook
- Call new complete-drill with proper payload
- Handle new response shape

---

## Phase 5: Testing

### 5.1 Unit Tests (Edge Functions)
1. Free user cannot complete >1 drill/day
2. Free user cannot complete level 2+ drill (unless unlocked)
3. SingleSport subscriber: unlimited for subscribed sport
4. Pro user: bypass level restrictions
5. Challenge drill triggers score submission
6. Idempotent completion (no duplicate progress)
7. Unlock rule validation

### 5.2 Integration Tests
1. JSON import: 150 drills inserted
2. Categories: 5 categories inserted
3. Drill fetching with unlock status

---

## Deliverables

| Item | Description |
|------|-------------|
| Migration SQL | Creates tables, inserts 150 drills |
| `complete-drill` | Full rewrite with all business logic |
| `submit-challenge-score` | Updated with score handling |
| `get-drills` | API for listing drills |
| `get-drill` | API for drill detail |
| `get-categories` | API for categories |
| `src/lib/constants.ts` | Shared constants |
| `useDrills` hook | Fetch drills from API |
| Test file | Unit tests for edge functions |
| README | Deployment & testing instructions |

---

## Acceptance Criteria

- [ ] `SELECT COUNT(*) FROM drills WHERE sport='football'` = 150
- [ ] Free user cannot complete >1 drill/day (server enforced)
- [ ] Unlock rules enforced server-side
- [ ] Challenge drills populate scores correctly
- [ ] complete-drill is idempotent
- [ ] API responses match specified shapes

---

## Implementation Order

1. **DB Migration** - Create tables, insert drills
2. **Shared Constants** - Create constants module
3. **complete-drill rewrite** - Full business logic
4. **API endpoints** - get-drills, get-drill, get-categories
5. **Client hooks** - useDrills, update useProgress
6. **Tests** - Edge function tests
7. **Documentation** - README, cURL examples

---

## Estimated Changes

- 1 DB migration (large, ~4600 lines for drill inserts)
- 4 edge functions (complete-drill rewrite, 3 new APIs)
- 1 shared constants file
- 2 new hooks
- Updates to DrillDetail, SportDetail components
- Test file

Shall I proceed with this plan?
