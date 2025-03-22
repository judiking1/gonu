import { create } from 'zustand';
import { supabase } from '../utils/supabase';
import { User } from '@supabase/supabase-js';
import type { Database } from '../utils/database.types';

interface AuthState {
  user: User | null;
  profile: Database['public']['Tables']['profiles']['Row'] | null;
  isLoading: boolean;
  initializeAuth: () => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loadProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  initializeAuth: async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      set({ user });
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        set({ profile });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  signUp: async (email: string, password: string, username: string) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    if (authData.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        username,
        avatar_url: null,
      });

      if (profileError) throw profileError;

      set({ user: authData.user });
    }
  },
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    set({ user: data.user });
  },
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ user: null, profile: null });
  },
  loadProfile: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      set({ profile });
    }
    set({ isLoading: false });
  },
}));
