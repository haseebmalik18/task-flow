export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  message?: string;
  user?: User;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<string>;
  logout: () => void;
  verifyEmail: (email: string, code: string) => Promise<AuthResponse>;
}
