-- server/schema.sql

-- 1) users
CREATE TABLE IF NOT EXISTS users (
  id             SERIAL PRIMARY KEY,
  username       TEXT    UNIQUE NOT NULL,
  password_hash  TEXT    NOT NULL,
  role           TEXT    NOT NULL DEFAULT 'student'
);

-- 2) subjects
CREATE TABLE IF NOT EXISTS subjects (
  id          SERIAL PRIMARY KEY,
  code        TEXT    UNIQUE NOT NULL,
  name        TEXT    NOT NULL,
  description TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3) enrollments
CREATE TABLE IF NOT EXISTS enrollments (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  subject_id  INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  UNIQUE(user_id,subject_id),
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4) applications
CREATE TABLE IF NOT EXISTS applications (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  subject_id   INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
