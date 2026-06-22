import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';


export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'strategic' | 'operative' | 'auditor';
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        setTimeout(() => {
          fetchUserProfile(session.user.id, session.user.email ?? undefined);
        }, 0);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id, session.user.email ?? undefined);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string, email?: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, email, full_name, is_active')
        .eq('id', userId)
        .maybeSingle();

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      const computedRole = (roleData?.role as UserProfile['role']) || 'operative';

      if (profile) {
        // Block deactivated users
        if ((profile as any).is_active === false) {
          await supabase.auth.signOut();
          setUser(null);
          setSession(null);
          setUserProfile(null);
          return;
        }
        setUserProfile({
          ...profile,
          role: computedRole
        });
      } else if (email) {
        setUserProfile({ id: userId, email, full_name: null, role: computedRole });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: fullName ? { full_name: fullName } : undefined
        }
      });
      
      if (error) {
        console.error('Auth signup error:', error);
        return { 
          data: null, 
          error,
          needsEmailConfirmation: false
        };
      }

      // Check if user was created successfully
      if (data?.user) {
        // Wait a moment for the trigger to process
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Verify the user profile was created
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', data.user.id)
            .maybeSingle();
            
          if (!profile) {
            console.warn('User profile not created automatically, may need manual activation');
          }
        } catch (profileError) {
          console.warn('Could not verify profile creation:', profileError);
        }
      }
      
      // Return both data and error for better handling
      return { 
        data, 
        error: null,
        needsEmailConfirmation: data?.user && !data?.session
      };
    } catch (unexpectedError) {
      console.error('Unexpected error during signup:', unexpectedError);
      return {
        data: null,
        error: { message: 'Unexpected error during registration. Please try again.' } as any,
        needsEmailConfirmation: false
      };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const isAdmin = userProfile?.role === 'admin';

  return {
    user,
    session,
    userProfile,
    loading,
    isAdmin,
    signIn,
    signUp,
    signOut,
  };
}