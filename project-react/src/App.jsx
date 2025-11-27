import { useAuth } from "./context/AuthContext";
import { useLocation } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import DashboardLayout from "./components/layout/DashboardLayout";

export default function App() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Detectar login
  const isLoginPage = location.pathname === "/login";

  if (loading)
    return <div className="text-center mt-20 text-gray-500">Cargando...</div>;

  // 🔥 Si está en login → no layout
  if (isLoginPage) return <AppRoutes />;

  // 🔥 Si está logueado → dashboard con layout completo
  if (user) {
    return (
      <DashboardLayout>
        <AppRoutes />
      </DashboardLayout>
    );
  }

  // 🔥 Si no está logueado → rutas sin sidebar/nav
  return <AppRoutes />;
}
