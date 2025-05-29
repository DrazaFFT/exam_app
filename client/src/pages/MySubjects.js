// client/src/pages/MySubjects.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';

export default function MySubjects() {
  const [subjects, setSubjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/my-subjects')
      .then(res => setSubjects(res.data))
      .catch(() => alert('Greška pri učitavanju predmeta'));
  }, []);

  return (
    <div className="container">
      <h2>Moji predmeti</h2>
      {/* global button */}
      <Link to="/applications/new" className="nav-button" style={{ marginBottom: '1rem', display: 'inline-block' }}>
        Prijavi ispit
      </Link>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Šifra</th>
            <th>Naziv</th>
            <th>Opis</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map(s => (
            <tr 
              key={s.id} 
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/applications/new/${s.id}`)}
            >
              <td>{s.id}</td>
              <td>{s.code}</td>
              <td>{s.name}</td>
              <td>{s.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
