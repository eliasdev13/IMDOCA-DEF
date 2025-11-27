import { createContext, useState, useContext, useEffect } from "react";
import { loginAPI, logoutAPI, refreshAPI } from "../api/auth";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Recupera el usuario del localStorage al INICIAR React
    const savedUser = localStorage.getItem("user");
    if (savedUser) return JSON.parse(savedUser);
    return null;
  });

  const [loading, setLoading] = useState(true);

  // LOGIN
  const login = async (email, password) => {
    const data = await loginAPI(email, password);

    const fullUser = { ...data.user, accessToken: data.accessToken };

    setUser(fullUser);

    // Guarda TODO lo necesario
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("user", JSON.stringify(data.user));
  };

  // LOGOUT
  const logout = async () => {
    try {
      await logoutAPI();
    } catch (err) {
      console.error("Error en logout:", err);
    } finally {
      setUser(null);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    }
  };

  // INIT (REFRESH + restaurar usuario)
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("accessToken");
      const savedUser = localStorage.getItem("user");

      if (token && savedUser) {
        try {
          const { accessToken } = await refreshAPI();

          const userData = JSON.parse(savedUser);

          const fullUser = {
            ...userData,
            accessToken,
          };

          setUser(fullUser);

          localStorage.setItem("accessToken", accessToken);
        } catch (err) {
          console.error("Refresh token failed:", err);
          await logout();
        }
      }

      setLoading(false);
    };

    init();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
