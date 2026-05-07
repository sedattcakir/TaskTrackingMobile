import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import auth from '@react-native-firebase/auth';
import {AuthContextType, User} from '../types/auth';
import {
  getUserProfile,
  loginRequest,
  logoutRequest,
} from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type Props = {
  children: React.ReactNode;
};

export function AuthProvider({children}: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async firebaseUser => {
      try {
        if (!firebaseUser) {
          setUser(null);
          setToken(null);
          return;
        }

        const [nextToken, profile] = await Promise.all([
          firebaseUser.getIdToken(),
          getUserProfile(firebaseUser.uid),
        ]);

        setToken(nextToken);
        setUser(profile);
      } finally {
        setInitializing(false);
      }
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    const data = await loginRequest({email, password});

    setUser(data.user);
    setToken(data.token);
  };

  const logout = async () => {
    await logoutRequest();
    setUser(null);
    setToken(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      initializing,
      isAuthenticated: !!token,
      login,
      logout,
    }),
    [user, token, initializing],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth AuthProvider içinde kullanılmalıdır.');
  }

  return context;
}
