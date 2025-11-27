import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function Navbar({ toggleSidebar }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [openProfileMenu, setOpenProfileMenu] = useState(false);

  return (
    <nav className="
      bg-white dark:bg-gray-900 
      border-b border-gray-200 dark:border-gray-700 
      text-gray-900 dark:text-white
      flex justify-between items-center 
      px-6 py-3 sticky top-0 z-50 shadow-sm
    ">
      {/* LOGO + Sidebar toggle */}
      <div className="flex items-center gap-4">
        {user && (
          <button 
            className="md:hidden text-2xl text-gray-700 dark:text-gray-300"
            onClick={toggleSidebar}
          >
            ☰
          </button>
        )}
        <span className="font-bold text-xl tracking-wide">IMDOCA</span>
      </div>

      {/* RIGHT BUTTONS */}
      <div className="flex items-center gap-4">

        {/* 🔆 Dark Mode Button */}
        <button
          onClick={toggleTheme}
          className="
            px-3 py-2 rounded-lg shadow-sm
            bg-gray-200 hover:bg-gray-300
            dark:bg-gray-800 dark:hover:bg-gray-700 
            transition
          "
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        {/* 👤 Profile */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setOpenProfileMenu(!openProfileMenu)}
              className="
                flex items-center justify-center
                w-10 h-10 rounded-full
                bg-gray-200 dark:bg-gray-700 
                text-gray-700 dark:text-gray-200
                font-semibold shadow
                hover:bg-gray-300 dark:hover:bg-gray-600
                transition
              "
            >
              {(user.name?.[0] || user.email?.[0] || "U").toUpperCase()}
            </button>

            {openProfileMenu && (
              <div className="
                absolute right-0 mt-2 w-40 
                bg-white dark:bg-gray-800 
                text-gray-800 dark:text-gray-200
                rounded-lg shadow-xl border 
                border-gray-200 dark:border-gray-700
                animate-fade-in
              ">
                <Link
                  to="/profile"
                  className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Perfil
                </Link>

                <button
                  onClick={logout}
                  className="block w-full px-4 py-2 text-left text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Salir
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </nav>
  );
}
