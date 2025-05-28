// client/src/pages/MySubjects.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';

export default function MySubjects() {
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    api.get('/my-subjects')
      .then(res => setSubjects(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Moji predmeti</h2>
      <ul>
        {subjects.map(s => (
          <li key={s.id}>
            {s.code} – {s.name}
            <Link to={`/applications/new/${s.id}`} style={{ marginLeft: '1rem' }}>
              Prijavi ispit
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
