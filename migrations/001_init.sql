create table users (
  id text primary key,
  email text not null unique,
  name text not null
);

create table sessions (
  token text primary key,
  user_id text not null references users (id) on delete cascade,
  expires_at timestamptz not null
);

create table documents (
  id text primary key,
  owner_id text not null references users (id),
  title text not null,
  body text not null default '',
  shared_with text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create index documents_owner on documents (owner_id);
