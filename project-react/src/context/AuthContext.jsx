import { createContext, useState, useContext, useEffect } from "react";
import { loginAPI, logoutAPI, refreshAPI } from "../api/auth";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

const login = async (email, password) => {
  const data = await loginAPI(email, password);
  setUser({ ...data.user, accessToken: data.accessToken }); // name, email, rol_id vienen en data.user
  localStorage.setItem("accessToken", data.accessToken);
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
    }
  };

  // INIT (refresh token)
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          const { accessToken } = await refreshAPI();
          const payload = JSON.parse(atob(accessToken.split(".")[1]));
          setUser({
            ...payload,
            accessToken,
            rol_id: payload.rol_id || payload.roleId, // 🔹 esto es clave
          });


          
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
