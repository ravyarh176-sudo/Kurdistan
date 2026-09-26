create table if not exists links (
  slug        text primary key,
  target_url  text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table links enable row level security;
