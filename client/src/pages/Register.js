// client/src/pages/Register.js
import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await register(username, password);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Greška pri registraciji');
    }
  };

  return (
    <div className="form-card">
      <h2>Registracija</h2>
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="reg-username">Korisničko ime</label>
          <input
            id="reg-username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            type="text"
            placeholder="Unesite korisničko ime"
            required
          />
        </div>
        <div>
          <label htmlFor="reg-password">Lozinka</label>
          <input
            id="reg-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            type="password"
            placeholder="Unesite lozinku"
            required
          />
        </div>
        <button type="submit">Registruj se</button>
      </form>
    </div>
  );
}
