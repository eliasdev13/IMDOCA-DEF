// src/components/layout/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ role }) {
  const { user, loading } = useAuth();

  // ⏳ Esperar a que AuthContext termine refresh/init
  if (loading) return <p>Cargando...</p>;

  // ❌ No logueado → enviar a login
  if (!user) return <Navigate to="/login" replace />;

  // ❌ No tiene el rol requerido
  if (role && user.rol_id !== role) return <Navigate to="/" replace />;

  // ✔ OK
  return <Outlet />;
}
