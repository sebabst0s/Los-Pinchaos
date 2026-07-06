-- =========================================================
-- Seed inicial de participantes
-- Ejecuta este archivo en el SQL Editor de Supabase después de schema.sql.
-- Los usuarios también pueden agregarse solos desde la app
-- si no están en esta lista.
-- =========================================================

insert into participants (name) values
  ('Jorge'),
  ('Nikole'),
  ('Isidora'),
  ('Javier'),
  ('Cristóbal'),
  ('Fiorella'),
  ('Kiara'),
  ('Alonso'),
  ('Camila'),
  ('Sebastián')
on conflict (name) do nothing;
