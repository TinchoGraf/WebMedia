-- Rol de mínimo privilegio para la app (correr UNA vez en Neon con el usuario dueño).
-- La app usa "app_web" en DATABASE_URL; las migraciones usan el dueño en DATABASE_URL_MIGRACIONES.
-- Reemplazar la contraseña por una generada (no la pegues en ningún chat ni repo).
CREATE ROLE app_web LOGIN PASSWORD 'CAMBIAR';
GRANT USAGE ON SCHEMA public TO app_web;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_web;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_web;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_web;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO app_web;
-- Sin CREATE, DROP ni ALTER: si alguien logra inyectar SQL, no puede borrar tablas.
