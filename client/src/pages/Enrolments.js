// client/src/pages/Enrolments.js
import React, { useState, useEffect } from 'react';
import api from '../api/api';

export default function Enrolments() {
  const [enrolments, setEnrolments] = useState([]);
  const [users, setUsers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [error, setError] = useState(null);

  // fetch users, subjects, and enrolments together
  const fetchData = async () => {
    try {
      const [enRes, userRes, subjRes] = await Promise.all([
        api.get('/enrollments'),
        api.get('/users'),
        api.get('/subjects'),
      ]);
      setEnrolments(enRes.data);
      setUsers(userRes.data);
      setSubjects(subjRes.data);
    } catch {
      setError('Greška pri učitavanju podataka');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssign = async () => {
    if (!selectedUser || !selectedSubject) return;
    try {
      await api.post('/enrollments', {
        user_id: selectedUser,
        subject_id: selectedSubject
      });
      // clear selection
      setSelectedUser('');
      setSelectedSubject('');
      // re-fetch to get the joined names immediately
      const res = await api.get('/enrollments');
      setEnrolments(res.data);
    } catch (err) {
      if (err.response?.status === 409) {
        alert(err.response.data.error);
      } else {
        alert('Greška pri dodeli predmeta.');
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Obrisati upis?')) return;
    try {
      await api.delete(`/enrollments/${id}`);
      setEnrolments(enrolments.filter(e => e.id !== id));
    } catch {
      alert('Greška pri brisanju.');
    }
  };

  return (
    <div className="container">
      <h2>Upravljanje upisima</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ marginBottom: '1rem' }}>
        <select
          value={selectedUser}
          onChange={e => setSelectedUser(e.target.value)}
        >
          <option value="">— odaberite studenta —</option>
          {users.map(u => (
            <option key={u.id} value={u.id}>
              {u.full_name}
            </option>
          ))}
        </select>

        <select
          style={{ marginLeft: '1rem' }}
          value={selectedSubject}
          onChange={e => setSelectedSubject(e.target.value)}
        >
          <option value="">— odaberite predmet —</option>
          {subjects.map(s => (
            <option key={s.id} value={s.id}>
              {s.code} – {s.name}
            </option>
          ))}
        </select>

        <button
          style={{ marginLeft: '1rem' }}
          onClick={handleAssign}
        >
          Dodeli
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Student</th>
            <th>Šifra predmeta</th>
            <th>Predmet</th>
            <th>Datum upisa</th>
            <th>Akcija</th>
          </tr>
        </thead>
        <tbody>
          {enrolments.map(e => (
            <tr key={e.id}>
              <td>{e.id}</td>
              <td>{e.student_name}</td>
              <td>{e.subject_code}</td>
              <td>{e.subject_name}</td>
              <td>{new Date(e.enrolled_at).toLocaleString()}</td>
              <td>
                <button onClick={() => handleDelete(e.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
