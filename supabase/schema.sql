-- Créer la table food_items
create table food_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  type        text not null check (type in ('ingredient', 'dish')),
  expiry_date date not null,
  added_at    timestamptz default now() not null,
  emoji       text,
  notes       text,
  quantity    numeric,
  unit        text
);

-- Activer Row Level Security (chaque user ne voit que ses données)
alter table food_items enable row level security;

-- Politique : un user peut tout faire sur ses propres lignes
create policy "Users manage their own items"
  on food_items
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
