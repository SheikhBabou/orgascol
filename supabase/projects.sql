-- Table Projets
create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  subject_id uuid references subjects(id) on delete cascade not null,
  title text not null,
  description text,
  start_date date not null,
  end_date date not null,
  status text not null default 'in_progress' check (status in ('not_started', 'in_progress', 'completed')),
  created_at timestamptz default now() not null
);

alter table projects enable row level security;
create policy "Users can manage their own projects"
  on projects for all using (auth.uid() = user_id);
