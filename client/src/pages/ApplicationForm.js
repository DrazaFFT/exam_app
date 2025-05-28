// client/src/pages/ApplicationForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/api';

export default function ApplicationForm() {
  const { subjectId: paramId } = useParams();
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState(paramId || '');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/my-subjects')
      .then(res => setSubjects(res.data))
      .catch(() => setError('Greška pri učitavanju predmeta'));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subjectId) {
      return setError('Molim odaberite predmet');
    }
    try {
      await api.post('/applications', { subject_id: subjectId });
      navigate('/applications');
    } catch (err) {
      setError(err.response?.data?.error || 'Greška prilikom prijave');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '2rem auto' }}>
      <h2>Nova prijava</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="subject">Predmet:</label><br/>
        <select
          id="subject"
          value={subjectId}
          onChange={e => setSubjectId(e.target.value)}
          required
          style={{ width: '100%', padding: '0.5rem' }}
        >
          <option value="">-- odaberite predmet --</option>
          {subjects.map(s => (
            <option key={s.id} value={s.id}>
              {s.code} – {s.name}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" style={{ padding: '0.5rem 1rem' }}>
        Pošalji prijavu
      </button>
    </form>
  );
}
