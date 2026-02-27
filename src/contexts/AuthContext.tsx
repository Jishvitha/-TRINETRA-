import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/db/supabase';
import type { User } from '@supabase/supabase-js';
import type { Profile, PoliceRegistrationData, PoliceIdVerification } from '@/types/index';

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  return data;
}

export async function verifyPoliceId(policeId: string): Promise<PoliceIdVerification> {
  try {
    const { data, error } = await supabase
      .from('police_ids')
      .select('is_valid, station_name')
      .eq('police_id', policeId)
      .maybeSingle();

    if (error) {
      console.error('Error verifying police ID:', error);
      return { is_valid: false, station_name: null };
    }

    if (!data) {
      return { is_valid: false, station_name: null };
    }

    return { 
      is_valid: (data as { is_valid: boolean; station_name: string }).is_valid, 
      station_name: (data as { is_valid: boolean; station_name: string }).station_name 
    };
  } catch (error) {
    console.error('Error in verifyPoliceId:', error);
    return { is_valid: false, station_name: null };
  }
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signInWithUsername: (username: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithUsername: (username: string, password: string) => Promise<{ error: Error | null }>;
  signUpPolice: (data: PoliceRegistrationData) => Promise<{ error: Error | null }>;
  verifyPoliceId: (policeId: string) => Promise<PoliceIdVerification>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null);
      return;
    }

    const profileData = await getProfile(user.id);
    setProfile(profileData);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        getProfile(session.user.id).then(setProfile);
      }
      setLoading(false);
    });
    // In this function, do NOT use any await calls. Use `.then()` instead to avoid deadlocks.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        getProfile(session.user.id).then(setProfile);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithUsername = async (username: string, password: string) => {
    try {
      const email = `${username}@miaoda.com`;
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUpWithUsername = async (username: string, password: string) => {
    try {
      const email = `${username}@miaoda.com`;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'citizen'
          }
        }
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUpPolice = async (data: PoliceRegistrationData) => {
    try {
      const email = `${data.username}@miaoda.com`;
      const { error } = await supabase.auth.signUp({
        email,
        password: data.password,
        options: {
          data: {
            role: 'police',
            full_name: data.full_name,
            official_email: data.official_email,
            police_id: data.police_id,
            police_station: data.police_station,
            verified: true
          }
        }
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      signInWithUsername, 
      signUpWithUsername, 
      signUpPolice,
      verifyPoliceId,
      signOut, 
      refreshProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
