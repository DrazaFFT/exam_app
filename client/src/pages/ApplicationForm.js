// client/src/pages/ApplicationForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/api';

export default function ApplicationForm() {
  const navigate = useNavigate();
  const { subjectId } = useParams();                // read from URL
  const [subjects, setSubjects] = useState([]);
  const [apps, setApps] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(subjectId || '');
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [mySubsRes, appsRes] = await Promise.all([
          api.get('/my-subjects'),
          api.get('/applications')
        ]);
        const mySubs = mySubsRes.data;
        const userApps = appsRes.data;
        setApps(userApps);

        // filter out already applied by code
        const appliedCodes = userApps.map(a => a.subject_code);
        const available = mySubs.filter(s => !appliedCodes.includes(s.code));
        setSubjects(available);
      } catch {
        setError('Greška pri učitavanju podataka');
      }
    };
    load();
  }, []);

  // if URL provided subjectId, pre-select it
  useEffect(() => {
    if (subjectId) {
      setSelectedSubject(subjectId);
    }
  }, [subjectId]);

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/applications', { subject_id: selectedSubject });
      navigate('/applications');
    } catch (err) {
      if (err.response?.status === 409) {
        setError('Već ste prijavili ovaj ispit');
      } else {
        setError('Greška pri prijavi');
      }
    }
  };

  return (
    <div className="form-card">
      <h2>Nova prijava ispita</h2>
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="subject">Predmet</label>
          <select
            id="subject"
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
        </div>
        <button type="submit" disabled={!selectedSubject}>
          Prijavi ispit
        </button>
      </form>
    </div>
  );
}
