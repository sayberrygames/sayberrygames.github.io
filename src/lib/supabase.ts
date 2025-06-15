import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration missing:', {
    url: !!supabaseUrl,
    key: !!supabaseAnonKey,
    env: import.meta.env
  });
  throw new Error('Missing Supabase environment variables. Please check your .env file or GitHub secrets.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for database
export interface DevNote {
  id: string;
  title: string;
  content: string;
  date: string;
  category: string;
  author: string;
  created_at: string;
  updated_at: string;
  published: boolean;
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
}