import { useState } from "react";
import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";
import AppRoutes from "./routes/AppRoutes";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading } = useAuth();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="flex min-h-screen">
      {user && (
        <Sidebar
          isOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          role={user.roleId}
          user={user}
        />
      )}

      <div className="flex-1 flex flex-col">
        <Navbar toggleSidebar={toggleSidebar} />

        <main className={`p-4 transition-all duration-300 ${user ? "md:ml-64" : ""}`}>
          <AppRoutes />
        </main>
      </div>
    </div>
  );
}
