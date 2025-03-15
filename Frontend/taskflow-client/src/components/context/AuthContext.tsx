import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import {
  AuthContextType,
  AuthState,
  RegisterData,
  AuthResponse,
} from "../types/auth.types";
import { authService } from "../services/api/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>(initialState);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      if (token) {
        setState({
          ...state,
          isAuthenticated: true,
          loading: false,
        });
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setState({ ...state, loading: true });
      const response = await authService.login(email, password);
      localStorage.setItem("token", response.token);
      setState({
        user: response.user || null,
        isAuthenticated: true,
        loading: false,
      });
    } catch (error) {
      setState({ ...state, loading: false });
      throw error;
    }
  };

  const register = async (userData: RegisterData): Promise<string> => {
    try {
      setState({ ...state, loading: true });
      const response = await authService.register(userData);
      setState({ ...state, loading: false });
      return response.message || "Registration successful";
    } catch (error) {
      setState({ ...state, loading: false });
      throw error;
    }
  };

  const verifyEmail = async (
    email: string,
    code: string
  ): Promise<AuthResponse> => {
    try {
      setState({ ...state, loading: true });
      const response = await authService.verifyEmail(email, code);

      setState({
        user: response.user || null,
        isAuthenticated: true,
        loading: false,
      });

      return response;
    } catch (error) {
      setState({ ...state, loading: false });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setState(initialState);
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        verifyEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
