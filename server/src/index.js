// /home/draza/exam_app/server/src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// ==== Authentication ==== 
app.post('/api/auth/register', async (req, res, next) => {
  const { username, password, role } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'username i password su obavezni' });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (username, password_hash, role)
       VALUES ($1, $2, $3)
       RETURNING id, username, role`,
      [username, hash, role || 'student']
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'username već postoji' });
    }
    next(err);
  }
});

app.post('/api/auth/login', async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'username i password su obavezni' });
  }
  try {
    const { rows } = await pool.query(
      'SELECT id, password_hash, role FROM users WHERE username = $1',
      [username]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'neispravan username ili password' });
    }
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'neispravan username ili password' });
    }
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    res.json({ token });
  } catch (err) {
    next(err);
  }
});

// ==== Middleware ==== 
function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Nema tokena' });
  }
  try {
    req.user = jwt.verify(auth.slice(7), process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Token nije validan ili je istekao' });
  }
}

function authorize(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ error: 'Nema dozvolu' });
    }
    next();
  };
}

// ==== Subjects CRUD (admin for write) ==== 
app.get('/api/subjects', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM subjects');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

app.post('/api/subjects', authenticate, authorize('admin'), async (req, res, next) => {
  const { code, name, description } = req.body;
  if (!code || !name) {
    return res.status(400).json({ error: 'code i name su obavezni' });
  }
  try {
    const { rows } = await pool.query(
      'INSERT INTO subjects (code, name, description) VALUES ($1, $2, $3) RETURNING *',
      [code, name, description]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

app.put('/api/subjects/:id', authenticate, authorize('admin'), async (req, res, next) => {
  const { id } = req.params;
  const { code, name, description } = req.body;
  if (!code || !name) {
    return res.status(400).json({ error: 'code i name su obavezni' });
  }
  try {
    const { rows } = await pool.query(
      'UPDATE subjects SET code=$1, name=$2, description=$3 WHERE id=$4 RETURNING *',
      [code, name, description, id]
    );
    if (!rows.length) {
      return res.status(404).json({ error: 'Predmet nije pronađen' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/subjects/:id', authenticate, authorize('admin'), async (req, res, next) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query('DELETE FROM subjects WHERE id=$1', [id]);
    if (!rowCount) {
      return res.status(404).json({ error: 'Predmet nije pronađen' });
    }
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

// ==== Student's My Subjects ==== 
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

// ==== Enrollments (admin) ==== 
app.get('/api/enrollments', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT e.id, u.id AS user_id, u.username,
              s.id AS subject_id, s.code, s.name, e.enrolled_at
       FROM enrollments e
       JOIN users u ON e.user_id = u.id
       JOIN subjects s ON e.subject_id = s.id`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

app.post('/api/enrollments', authenticate, authorize('admin'), async (req, res, next) => {
  const { user_id, subject_id } = req.body;
  if (!user_id || !subject_id) {
    return res.status(400).json({ error: 'user_id i subject_id su obavezni' });
  }
  try {
    const { rows } = await pool.query(
      'INSERT INTO enrollments (user_id, subject_id) VALUES ($1, $2) RETURNING *',
      [user_id, subject_id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/enrollments/:id', authenticate, authorize('admin'), async (req, res, next) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query('DELETE FROM enrollments WHERE id=$1', [id]);
    if (!rowCount) {
      return res.status(404).json({ error: 'Enrollment nije pronađen' });
    }
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

// ==== Users management (admin) ==== 
app.get('/api/users', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT id, username, role FROM users');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

app.put('/api/users/:id', authenticate, authorize('admin'), async (req, res, next) => {
  const { id } = req.params;
  const { role } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE users SET role=$1 WHERE id=$2 RETURNING id, username, role',
      [role, id]
    );
    if (!rows.length) {
      return res.status(404).json({ error: 'Korisnik nije pronađen' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/users/:id', authenticate, authorize('admin'), async (req, res, next) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query('DELETE FROM users WHERE id=$1', [id]);
    if (!rowCount) {
      return res.status(404).json({ error: 'Korisnik nije pronađen' });
    }
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

// ==== Applications CRUD (student) ==== 
app.get('/api/applications', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         a.id,
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
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM applications WHERE id=$1', [id]);
    if (!rows.length) {
      return res.status(404).json({ error: 'Prijava nije pronađena' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

app.post('/api/applications', authenticate, async (req, res, next) => {
  const { subject_id } = req.body;
  if (!subject_id) {
    return res.status(400).json({ error: 'subject_id je obavezan' });
  }
  try {
    const { rows } = await pool.query(
      'INSERT INTO applications (user_id, subject_id) VALUES ($1, $2) RETURNING *',
      [req.user.userId, subject_id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

app.put('/api/applications/:id', authenticate, async (req, res, next) => {
  const { id } = req.params;
  const { subject_id } = req.body;
  if (!subject_id) {
    return res.status(400).json({ error: 'subject_id je obavezan' });
  }
  try {
    const { rows } = await pool.query(
      'UPDATE applications SET subject_id=$1 WHERE id=$2 RETURNING *',
      [subject_id, id]
    );
    if (!rows.length) {
      return res.status(404).json({ error: 'Prijava nije pronađena' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/applications/:id', authenticate, async (req, res, next) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query('DELETE FROM applications WHERE id=$1', [id]);
    if (!rowCount) {
      return res.status(404).json({ error: 'Prijava nije pronađena' });
    }
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

// Central error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Interna greška servera' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server sluša na portu ${PORT}`));
