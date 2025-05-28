import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/api';

export default function SubjectForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isEdit) {
      api.get('/subjects')
        .then(res => {
          const subj = res.data.find(s => s.id === parseInt(id, 10));
          if (subj) {
            setCode(subj.code);
            setName(subj.name);
            setDescription(subj.description || '');
          }
        })
        .catch(() => setError('Greška pri učitavanju predmeta'));
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code || !name) {
      return setError('Kod i naziv su obavezni');
    }
    try {
      if (isEdit) {
        await api.put(`/subjects/${id}`, { code, name, description });
      } else {
        await api.post('/subjects', { code, name, description });
      }
      navigate('/subjects');
    } catch (err) {
      setError(err.response?.data?.error || 'Greška pri čuvanju');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '2rem auto' }}>
      <h2>{isEdit ? `Izmeni predmet #${id}` : 'Novi predmet'}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ marginBottom: '1rem' }}>
        <label>Kod:</label><br />
        <input
          type="text"
          value={code}
          onChange={e => setCode(e.target.value)}
          required
          style={{ width: '100%', padding: '0.5rem' }}
        />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label>Naziv:</label><br />
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          style={{ width: '100%', padding: '0.5rem' }}
        />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label>Opis:</label><br />
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          style={{ width: '100%', padding: '0.5rem' }}
        />
      </div>
      <button type="submit" style={{ padding: '0.5rem 1rem' }}>
        Sačuvaj
      </button>
    </form>
  );
}
