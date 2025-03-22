import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Lobby from './pages/lobby/Lobby';
import { useAuthStore } from './stores/authStore';
import { useEffect } from 'react';
import DashboardPage from './pages/DashboardPage';
import AuthPage from './pages/AuthPage';
import GamePage from './pages/GamePage';

function App() {
  const { user, isLoading, loadProfile } = useAuthStore();

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <Navigate to="/lobby" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/login"
          element={user ? <Navigate to="/lobby" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/lobby" replace /> : <Register />}
        />
        <Route
          path="/lobby"
          element={user ? <Lobby /> : <Navigate to="/login" replace />}
        />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/game/:gameId" element={<GamePage />} />
      </Routes>
    </Router>
  );
}

export default App;
