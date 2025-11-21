import React, { createContext, useState, useEffect, useContext } from "react";
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const extra = Constants.expoConfig?.extra ?? {};
const supabaseUrl = extra.supabaseUrl;
const supabaseAnonKey = extra.supabaseAnonKey;

// Supabase Client untuk frontend (menggunakan anon key)
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage, // Menggunakan AsyncStorage untuk persistensi sesi
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Inisialisasi session dan user saat aplikasi dimuat
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listener untuk perubahan state auth
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    user,
    isAuthenticated: !!user,
    loading,
    supabase,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
