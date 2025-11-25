import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Navbar({ toggleSidebar }) {
  const { user, logout } = useAuth();
  const [openProfileMenu, setOpenProfileMenu] = useState(false);

  return (
    <nav className="bg-gray-800 text-white flex justify-between items-center px-4 py-3 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        {user && (
          <button className="md:hidden" onClick={toggleSidebar}>
            ☰
          </button>
        )}
        <span className="font-bold text-xl">IMDOCA</span>
      </div>

      {user && (
        <div className="relative">
          <button
            onClick={() => setOpenProfileMenu(!openProfileMenu)}
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-700 hover:bg-gray-600 transition"
          >
            {(user?.name?.[0] || user?.email?.[0] || "U").toUpperCase()}
          </button>

          {openProfileMenu && (
            <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded shadow-lg">
              <Link
                to="/profile"
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Perfil
              </Link>

              <button
                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                onClick={logout}
              >
                Salir
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
