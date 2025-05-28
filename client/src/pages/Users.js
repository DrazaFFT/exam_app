// client/src/pages/Users.js
import React, { useState, useEffect } from 'react';
import api from '../api/api';

export default function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () =>
    api.get('/users').then(res => setUsers(res.data));

  const handleRoleChange = async (id, role) => {
    await api.put(`/users/${id}`, { role });
    fetchUsers();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Obrisati korisnika?')) return;
    await api.delete(`/users/${id}`);
    fetchUsers();
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Korisnici</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Role</th>
            <th>Akcije</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
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
              <td><button onClick={()=>handleDelete(u.id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
)}
