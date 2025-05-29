// client/src/pages/Users.js
import React, { useState, useEffect } from 'react';
import api from '../api/api';

export default function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get('/users').then(res => setUsers(res.data));
  }, []);

  const handleRoleChange = async (id, role) => {
    const { data } = await api.put(`/users/${id}`, { role });
    setUsers(users.map(u => (u.id === id ? data : u)));
  };

  const handleDelete = async id => {
    if (!window.confirm('Obrisati korisnika?')) return;
    await api.delete(`/users/${id}`);
    setUsers(users.filter(u => u.id !== id));
  };

  return (
    <div className="container">
      <h2>Upravljanje korisnicima</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Ime i prezime</th> {/* ← header changed */}
            <th>Username</th>
            <th>Uloga</th>
            <th>Telefon</th>
            <th>Email</th>
            <th>Akcije</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.full_name}</td> {/* ← updated */}
              <td>{u.username}</td>
              <td>
                <select
                  value={u.role}
                  onChange={e => handleRoleChange(u.id, e.target.value)}
                >
                  <option value="student">student</option>
                  <option value="admin">admin</option>
                </select>
              </td>
              <td>{u.phone}</td>
              <td>{u.email}</td>
              <td>
                <button onClick={() => handleDelete(u.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
