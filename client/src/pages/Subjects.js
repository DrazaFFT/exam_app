import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);

  const fetchSubjects = () => {
    api.get('/subjects')
       .then(res => setSubjects(res.data))
       .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Obrisati predmet?')) return;
    try {
      await api.delete(`/subjects/${id}`);
      fetchSubjects();
    } catch (err) {
      console.error(err);
      alert('Greška prilikom brisanja');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Predmeti</h2>
      <Link to="/subjects/new"><button>Dodaj predmet</button></Link>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>ID</th>
            <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Kod</th>
            <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Naziv</th>
            <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Opis</th>
            <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Akcije</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map(s => (
            <tr key={s.id}>
              <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>{s.id}</td>
              <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>{s.code}</td>
              <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>{s.name}</td>
              <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>{s.description}</td>
              <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>
                <Link to={`/subjects/${s.id}/edit`} style={{ marginRight: '1rem' }}>Edit</Link>
                <button onClick={() => handleDelete(s.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
