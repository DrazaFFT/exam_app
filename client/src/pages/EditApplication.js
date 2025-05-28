// client/src/pages/EditApplication.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';

export default function EditApplication() {
  const { id } = useParams();
  const [studentName, setStudentName] = useState('');
  const [examCode, setExamCode] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/applications/${id}`)
      .then(res => {
        setStudentName(res.data.student_name);
        setExamCode(res.data.exam_code);
      })
      .catch(() => setError('Greška pri učitavanju prijave'));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await api.put(`/applications/${id}`, {
        student_name: studentName,
        exam_code: examCode,
      });
      navigate('/applications');
    } catch (err) {
      setError(err.response?.data?.error || 'Greška pri izmeni prijave');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '2rem auto' }}>
      <h2>Izmena prijave #{id}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ marginBottom: '1rem' }}>
        <label>Student ime:</label><br/>
        <input
          type="text"
          value={studentName}
          onChange={e => setStudentName(e.target.value)}
          required
          style={{ width: '100%', padding: '0.5rem' }}
        />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label>Šifra ispita:</label><br/>
        <input
          type="text"
          value={examCode}
          onChange={e => setExamCode(e.target.value)}
          pattern="OM\d{3}"
          title="Format OMXXX, npr. OM140"
          required
          style={{ width: '100%', padding: '0.5rem' }}
        />
      </div>
      <button type="submit" style={{ padding: '0.5rem 1rem' }}>Sačuvaj izmene</button>
    </form>
  );
}
