// client/src/App.js
import React, { useContext } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link
} from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

import Login            from './pages/Login';
import Register         from './pages/Register';
import Subjects         from './pages/Subjects';
import SubjectForm      from './pages/SubjectForm';
import MySubjects       from './pages/MySubjects';
import Applications     from './pages/Applications';
import ApplicationForm  from './pages/ApplicationForm';
import EditApplication  from './pages/EditApplication';
import Enrolments       from './pages/Enrolments';
import Users            from './pages/Users';

import './App.css';

function Navbar() {
  const { token, user, logout } = useContext(AuthContext);

  return (
    <nav className="navbar">
      {!token && (
        <>
          <Link to="/login"    className="nav-link">Login</Link>
          <Link to="/register" className="nav-link">Register</Link>
        </>
      )}

      {token && user?.role === 'admin' && (
        <>
          <Link to="/subjects"      className="nav-link">Predmeti</Link>
          <Link to="/subjects/new"  className="nav-link">Dodaj predmet</Link>
          <Link to="/enrolments"    className="nav-link">Upravljanje upisima</Link>
          <Link to="/users"         className="nav-link">Korisnici</Link>
        </>
      )}

      {token && user?.role === 'student' && (
        <>
          <Link to="/my-subjects"        className="nav-link">Moji predmeti</Link>
          <Link to="/applications"       className="nav-link">Prijave</Link>
          <Link to="/applications/new"   className="nav-link">Nova prijava</Link>
        </>
      )}

      {token && (
        <button onClick={logout} className="nav-button">Logout</button>
      )}
    </nav>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/applications" replace />} />

      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/subjects"
        element={
          <PrivateRoute>
            <Subjects />
          </PrivateRoute>
        }
      />
      <Route
        path="/subjects/new"
        element={
          <PrivateRoute>
            <SubjectForm />
          </PrivateRoute>
        }
      />
      <Route
        path="/subjects/:id/edit"
        element={
          <PrivateRoute>
            <SubjectForm />
          </PrivateRoute>
        }
      />

      <Route
        path="/my-subjects"
        element={
          <PrivateRoute>
            <MySubjects />
          </PrivateRoute>
        }
      />

      <Route
        path="/applications"
        element={
          <PrivateRoute>
            <Applications />
          </PrivateRoute>
        }
      />
      <Route
        path="/applications/new"
        element={
          <PrivateRoute>
            <ApplicationForm />
          </PrivateRoute>
        }
      />
      <Route
        path="/applications/:id/edit"
        element={
          <PrivateRoute>
            <EditApplication />
          </PrivateRoute>
        }
      />

      <Route
        path="/enrolments"
        element={
          <PrivateRoute>
            <Enrolments />
          </PrivateRoute>
        }
      />
      <Route
        path="/users"
        element={
          <PrivateRoute>
            <Users />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
