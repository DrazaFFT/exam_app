// client/src/pages/Applications.js
import React, { useState, useEffect } from 'react';
import api from '../api/api';

export default function Applications() {
  const [apps, setApps] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/applications')
      .then(res => setApps(res.data))
      .catch(err => setError(err.response?.data?.error || 'Greška pri učitavanju'));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Obrisati prijavu?')) return;
    try {
      await api.delete(`/applications/${id}`);
      setApps(apps.filter(a => a.id !== id));
    } catch {
      alert('Greška pri brisanju');
    }
  };

  return (
    <div className="container">
      <h2>Spisak prijava</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Student</th>
            <th>Šifra ispita</th>
            <th>Vreme</th>
            <th>Akcije</th>
          </tr>
        </thead>
        <tbody>
          {apps.map(a => (
            <tr key={a.id}>
              <td>{a.id}</td>
              <td>{a.student}</td>
              <td>{a.subject_code}</td>
              <td>{new Date(a.submitted_at).toLocaleString()}</td>
              <td>
                <button onClick={() => handleDelete(a.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
