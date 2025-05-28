// server/src/index.js
const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(express.json());

// --- Auth middleware ---
function authenticate(req, res, next) {
  const auth = req.headers.authorization?.split(' ');
  if (auth?.[0] !== 'Bearer' || !auth[1]) {
    return res.status(401).json({ error: 'Nedostaje token' });
  }
  try {
    req.user = jwt.verify(auth[1], process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token nije validan ili je istekao' });
  }
}

// --- Authorization for admin ---
function authorize(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ error: 'Nemaš ovlašćenje' });
    }
    next();
  };
}

// --- Health check ---
app.get('/', (req, res) => res.send('OK'));

// --- REGISTER ---
app.post('/api/auth/register', async (req, res, next) => {
  try {
    const { username, password, role = 'student' } = req.body;
    const insert = `
      INSERT INTO users (username, password_hash, role)
      VALUES ($1, crypt($2::text, gen_salt('bf')), $3)
      RETURNING id, username, role
    `;
    const { rows } = await pool.query(insert, [username, password, role]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// --- LOGIN ---
app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const select = 
      'SELECT id, role FROM users ' +
      'WHERE username = $1 ' +
      '  AND password_hash = crypt($2::text, password_hash)';
    const { rows } = await pool.query(select, [username, password]);
    if (!rows[0]) {
      return res.status(401).json({ error: 'Neispravan username ili password' });
    }
    const token = jwt.sign(
      { userId: rows[0].id, role: rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({ token });
  } catch (err) {
    next(err);
  }
});

// --- PROFILE ROUTES ---
app.get('/api/profile', authenticate, async (req, res, next) => {
  try {
    const select = 
      'SELECT id, username, role, first_name, last_name, phone, email ' +
      'FROM users WHERE id = $1';
    const { rows } = await pool.query(select, [req.user.userId]);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

app.put('/api/profile', authenticate, async (req, res, next) => {
  try {
    const { first_name, last_name, phone, email } = req.body;
    const update =
      'UPDATE users SET first_name=$1, last_name=$2, phone=$3, email=$4 ' +
      'WHERE id=$5 RETURNING id, username, role, first_name, last_name, phone, email';
    const { rows } = await pool.query(update, [
      first_name, last_name, phone, email, req.user.userId
    ]);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// --- Subjects CRUD ---
app.get('/api/subjects', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM subjects ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

app.post('/api/subjects', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { code, name, description } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO subjects (code, name, description)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [code, name, description]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

app.put('/api/subjects/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { code, name, description } = req.body;
    const { rows } = await pool.query(
      `UPDATE subjects
       SET code = $1, name = $2, description = $3
       WHERE id = $4
       RETURNING *`,
      [code, name, description, id]
    );
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/subjects/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    await pool.query('DELETE FROM subjects WHERE id = $1', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// --- My Subjects for Students ---
app.get('/api/my-subjects', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT s.id, s.code, s.name, s.description
       FROM subjects s
       JOIN enrollments e ON e.subject_id = s.id
       WHERE e.user_id = $1`,
      [req.user.userId]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// --- Enrollments (Admin) ---
app.get('/api/enrollments', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT e.id,
              u.id   AS user_id, u.username,
              s.id   AS subject_id, s.code, s.name,
              e.enrolled_at
       FROM enrollments e
       JOIN users    u ON u.id = e.user_id
       JOIN subjects s ON s.id = e.subject_id`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

app.post('/api/enrollments', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { user_id, subject_id } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO enrollments (user_id, subject_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, subject_id) DO NOTHING
       RETURNING *`,
      [user_id, subject_id]
    );
    if (rows.length === 0) {
      return res.status(409).json({ error: 'Student već upisan na ovaj predmet' });
    }
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/enrollments/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    await pool.query('DELETE FROM enrollments WHERE id = $1', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// --- Users Management (Admin) ---
app.get('/api/users', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, username, role, first_name, last_name, phone, email
       FROM users`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

app.put('/api/users/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { role } = req.body;
    const { rows } = await pool.query(
      `UPDATE users
       SET role = $1
       WHERE id = $2
       RETURNING id, username, role`,
      [role, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/users/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// --- Applications CRUD ---
app.get('/api/applications', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT a.id,
              u.username   AS student,
              s.code       AS subject_code,
              a.submitted_at
       FROM applications a
       JOIN users    u ON a.user_id    = u.id
       JOIN subjects s ON a.subject_id = s.id
       WHERE a.user_id = $1
       ORDER BY a.submitted_at DESC`,
      [req.user.userId]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

app.get('/api/applications/:id', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT a.id,
              u.username   AS student,
              s.code       AS subject_code,
              a.submitted_at
       FROM applications a
       JOIN users    u ON a.user_id    = u.id
       JOIN subjects s ON a.subject_id = s.id
       WHERE a.id = $1 AND a.user_id = $2`,
      [req.params.id, req.user.userId]
    );
    if (!rows[0]) {
      return res.status(404).json({ error: 'Prijava nije pronađena' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

app.post('/api/applications', authenticate, async (req, res, next) => {
  try {
    const { subject_id } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO applications (user_id, subject_id)
       VALUES ($1, $2)
       RETURNING id, user_id, subject_id, submitted_at`,
      [req.user.userId, subject_id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

app.put('/api/applications/:id', authenticate, async (req, res, next) => {
  try {
    const { subject_id } = req.body;
    const { rows } = await pool.query(
      `UPDATE applications
       SET subject_id = $1
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [subject_id, req.params.id, req.user.userId]
    );
    if (!rows[0]) {
      return res.status(404).json({ error: 'Prijava nije pronađena' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/applications/:id', authenticate, async (req, res, next) => {
  try {
    await pool.query(
      `DELETE FROM applications
       WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.userId]
    );
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// --- Global Error Handler ---
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server sluša na portu ${PORT}`));
