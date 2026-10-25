-- ============================================
-- Orga'Scol - Schema de la base de donnees
-- ============================================

-- Matieres
create table subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  color text not null default '#3B82F6',
  created_at timestamptz default now() not null
);

alter table subjects enable row level security;
create policy "Users can manage their own subjects"
  on subjects for all using (auth.uid() = user_id);

-- Examens
create table exams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  subject_id uuid references subjects(id) on delete cascade not null,
  title text not null,
  exam_date date not null,
  teacher text,
  created_at timestamptz default now() not null
);

alter table exams enable row level security;
create policy "Users can manage their own exams"
  on exams for all using (auth.uid() = user_id);

-- Chapitres a reviser
create table chapters (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid references exams(id) on delete cascade not null,
  title text not null,
  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'completed')),
  position integer not null default 0,
  notes text,
  created_at timestamptz default now() not null
);

alter table chapters enable row level security;
create policy "Users can manage chapters of their exams"
  on chapters for all using (
    exists (
      select 1 from exams where exams.id = chapters.exam_id and exams.user_id = auth.uid()
    )
  );

-- Creneaux emploi du temps
create table schedule_slots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  day_of_week integer not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  label text,
  slot_type text not null default 'busy'
    check (slot_type in ('class', 'busy', 'revision')),
  created_at timestamptz default now() not null
);

alter table schedule_slots enable row level security;
create policy "Users can manage their own schedule"
  on schedule_slots for all using (auth.uid() = user_id);

-- Sessions de revision generees
create table revision_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  chapter_id uuid references chapters(id) on delete cascade not null,
  scheduled_date date not null,
  start_time time not null,
  end_time time not null,
  method text not null default 'active_review'
    check (method in ('first_read', 'active_review', 'spaced_repetition', 'final_review')),
  status text not null default 'pending'
    check (status in ('pending', 'completed', 'skipped')),
  created_at timestamptz default now() not null
);

alter table revision_sessions enable row level security;
create policy "Users can manage their own revision sessions"
  on revision_sessions for all using (auth.uid() = user_id);
