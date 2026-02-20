create table if not exists public.client_error_reports (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  occurred_at timestamptz not null,
  user_id uuid references auth.users(id) on delete set null,
  level text not null default 'error',
  source text,
  message text not null,
  stack text,
  context jsonb not null default '{}'::jsonb,
  user_agent text
);

alter table public.client_error_reports enable row level security;

create index if not exists client_error_reports_created_at_idx
  on public.client_error_reports (created_at desc);

create index if not exists client_error_reports_user_id_idx
  on public.client_error_reports (user_id);
