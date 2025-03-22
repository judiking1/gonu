import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { supabase } from './utils/supabase';
import { useUserStore } from './stores/userStore';

supabase.auth.getSession().then(({ data: { session } }) => {
  if (session?.user) {
    useUserStore.getState().setUser({
      id: session.user.id,
      email: session.user.email || '',
    });
  }
});

supabase.auth.onAuthStateChange((_event, session) => {
  if (session?.user) {
    useUserStore.getState().setUser({
      id: session.user.id,
      email: session.user.email || '',
    });
  } else {
    useUserStore.getState().clearUser();
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
