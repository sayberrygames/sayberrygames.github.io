import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isTeamMember: boolean;
  userRole: 'admin' | 'lead' | 'member' | 'user' | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTeamMember, setIsTeamMember] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'lead' | 'member' | 'user' | null>(null);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      checkUserRole(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      checkUserRole(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserRole = async (user: User | null) => {
    if (!user) {
      setIsAdmin(false);
      setIsTeamMember(false);
      setUserRole(null);
      return;
    }

    // Check user_metadata first (set via Auth)
    const role = user.user_metadata?.role || 'user';
    
    setUserRole(role as 'admin' | 'lead' | 'member' | 'user');
    setIsAdmin(role === 'admin');
    setIsTeamMember(['admin', 'lead', 'member'].includes(role));
    
    // Special case for initial admin setup
    if (user.email === 'sayberrygames@gmail.com' && role === 'user') {
      setUserRole('admin');
      setIsAdmin(true);
      setIsTeamMember(true);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, isAdmin, isTeamMember, userRole }}>
      {children}
    </AuthContext.Provider>
  );
};