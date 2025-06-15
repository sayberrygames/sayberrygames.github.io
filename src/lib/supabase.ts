import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hapjsigxjmogajicrtjd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhcGpzaWd4am1vZ2FqaWNydGpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NjY0NzAsImV4cCI6MjA2NTU0MjQ3MH0.bbpg-3153R-DMaMKo6LyiBqT-n0Q-ngId0bkcw3MCc4';

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