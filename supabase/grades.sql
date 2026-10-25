-- Ajouter ue_name et coefficient aux matieres
alter table subjects add column if not exists ue_name text;
alter table subjects add column if not exists ects decimal(4,1) default 0;

-- Notes / evaluations
create table grades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  subject_id uuid references subjects(id) on delete cascade not null,
  title text not null,
  grade decimal(5,2) not null,
  max_grade decimal(5,2) not null default 20,
  coefficient decimal(4,2) not null default 1,
  created_at timestamptz default now() not null
);

alter table grades enable row level security;
create policy "Users can manage their own grades"
  on grades for all using (auth.uid() = user_id);
