// client/src/pages/Login.js
import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await login(username, password);
    } catch (err) {
      setError(err.response?.data?.error || 'Greška pri prijavi');
    }
  };

  return (
    <div className="form-card">
      <h2>Login</h2>
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            type="text"
            placeholder="Unesite korisničko ime"
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            type="password"
            placeholder="Unesite lozinku"
            required
          />
        </div>
        <button type="submit">Prijava</button>
      </form>
    </div>
  );
}
