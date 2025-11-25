import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ role }) => {
  const { user, loading } = useAuth();

  if (loading) return <p>Cargando...</p>; // Espera a que cargue el contexto
  if (!user) return <Navigate to="/login" replace />; // No está logueado
  if (role && user.rol_id !== role) return <Navigate to="/" replace />;

  return <Outlet />; // Renderiza las rutas hijas
};

export default ProtectedRoute;
