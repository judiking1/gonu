import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Lobby from './pages/lobby/Lobby';
import Home from './pages/Home';
import Header from './components/layout/Header';
import Profile from './pages/profile/Profile';
import CreateGame from './pages/game/CreateGame';
import Game from './pages/game/Game';

function App() {
  const { initializeAuth, isLoading } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="w-full h-full bg-gray-50">
        <Header />
        <div className="pt-16 h-[calc(100%-64px)]">
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/lobby" element={<Lobby />} />
              <Route path="/profile/:userId" element={<Profile />} />
              <Route path="/game/create" element={<CreateGame />} />
              <Route path="/game/:gameId" element={<Game />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
