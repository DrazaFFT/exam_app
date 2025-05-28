// client/src/pages/Profile.js
import React, { useState, useEffect } from 'react';
import api from '../api/api';

export default function Profile() {
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: ''
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/profile')
      .then(res => setProfile(res.data))
      .catch(() => setError('Greška pri učitavanju profila'));
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/profile', profile);
      setProfile(res.data);
      setError(null);
      alert('Profil uspešno sačuvan.');
    } catch {
      setError('Greška pri ažuriranju profila');
    }
  };

  return (
    <div className="form-card">
      <h2>Moj profil</h2>
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="first_name">Ime</label>
          <input
            id="first_name"
            name="first_name"
            value={profile.first_name}
            onChange={handleChange}
            placeholder="Ime"
          />
        </div>
        <div>
          <label htmlFor="last_name">Prezime</label>
          <input
            id="last_name"
            name="last_name"
            value={profile.last_name}
            onChange={handleChange}
            placeholder="Prezime"
          />
        </div>
        <div>
          <label htmlFor="phone">Telefon</label>
          <input
            id="phone"
            name="phone"
            value={profile.phone}
            onChange={handleChange}
            placeholder="Telefon"
          />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={profile.email}
            onChange={handleChange}
            placeholder="Email"
          />
        </div>
        <button type="submit">Sačuvaj profil</button>
      </form>
    </div>
  );
}
