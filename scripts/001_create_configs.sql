-- OpenClaw configuration storage
create table if not exists public.openclaw_configs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  config_name text not null default 'default',
  auth_provider text not null default 'openrouter-api-key',
  auth_secret text not null default '',
  model text default '',
  telegram_token text default '',
  discord_token text default '',
  slack_bot_token text default '',
  slack_app_token text default '',
  raw_config jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, config_name)
);

alter table public.openclaw_configs enable row level security;

create policy "configs_select_own" on public.openclaw_configs
  for select using (auth.uid() = user_id);

create policy "configs_insert_own" on public.openclaw_configs
  for insert with check (auth.uid() = user_id);

create policy "configs_update_own" on public.openclaw_configs
  for update using (auth.uid() = user_id);

create policy "configs_delete_own" on public.openclaw_configs
  for delete using (auth.uid() = user_id);
