export type User = {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Personel';
  profileImage?: string | null;
  createdTime?: string;
};

export type AuthContextType = {
  user: User | null;
  token: string | null;
  initializing: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};
