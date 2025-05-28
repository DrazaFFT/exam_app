// client/src/pages/Enrolments.js
import React, { useState, useEffect } from 'react';
import api from '../api/api';

export default function Enrolments() {
  const [enrolments, setEnrolments] = useState([]);
  const [users, setUsers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  // fetch data
  useEffect(() => {
    api.get('/enrollments').then(res => setEnrolments(res.data));
    api.get('/users').then(res => setUsers(res.data));
    api.get('/subjects').then(res => setSubjects(res.data));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Obrisati upis?')) return;
    await api.delete(`/enrollments/${id}`);
    setEnrolments(enrolments.filter(e => e.id !== id));
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    await api.post('/enrollments', { user_id: selectedUser, subject_id: selectedSubject });
    const res = await api.get('/enrollments');
    setEnrolments(res.data);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Upravljanje upisima</h2>
      <form onSubmit={handleAssign} style={{ marginBottom: '2rem' }}>
        <select value={selectedUser} onChange={e=>setSelectedUser(e.target.value)} required>
          <option value="">Izaberite studenta</option>
          {users.map(u=><option key={u.id} value={u.id}>{u.username}</option>)}
        </select>
        <select value={selectedSubject} onChange={e=>setSelectedSubject(e.target.value)} required style={{ marginLeft: '1rem' }}>
          <option value="">Izaberite predmet</option>
          {subjects.map(s=><option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}
        </select>
        <button type="submit" style={{ marginLeft: '1rem' }}>Dodeli</button>
      </form>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Student</th>
            <th>Predmet</th>
            <th>Dodeljeno</th>
            <th>Akcije</th>
          </tr>
        </thead>
        <tbody>
          {enrolments.map(e => (
            <tr key={e.id}>
              <td>{e.id}</td>
              <td>{e.username}</td>
              <td>{e.code} - {e.name}</td>
              <td>{new Date(e.enrolled_at).toLocaleString()}</td>
              <td><button onClick={()=>handleDelete(e.id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
)}
