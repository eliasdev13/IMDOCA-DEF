import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  HomeIcon,
  ShoppingCartIcon,
  UsersIcon,
  ClipboardIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

export default function Sidebar({ isOpen, toggleSidebar }) {
  const { user, logout } = useAuth();
  const role = user?.rol_id || user?.roleId;

  if (!user) return null; // 🔹 mientras carga el usuario

  const linksByRole = {
    1: [
      { title: "Register User", path: "/createUser", icon: <ClipboardIcon className="w-5 h-5" /> },
      { title: "Register Client", path: "/createClient", icon: <ClipboardIcon className="w-5 h-5" /> },
      { title: "Register Product", path: "/createProduct", icon: <ClipboardIcon className="w-5 h-5" /> },
      { title: "Dashboard", path: "/admin", icon: <ClipboardIcon className="w-5 h-5" /> },
      { title: "Products", path: "/products", icon: <ClipboardIcon className="w-5 h-5" /> },
      { title: "Orders", path: "/admin/orders", icon: <ClipboardIcon className="w-5 h-5" /> },
      { title: "Users", path: "/admin/users", icon: <UsersIcon className="w-5 h-5" /> },
    ],
    2: [
      { title: "Dashboard", path: "/seller", icon: <ClipboardIcon className="w-5 h-5" /> },
      { title: "Products", path: "/products", icon: <ClipboardIcon className="w-5 h-5" /> },
      { title: "Inventory", path: "/inventory", icon: <ClipboardIcon className="w-5 h-5" /> },
      { title: "Cart", path: "/cart", icon: <ShoppingCartIcon className="w-5 h-5" /> },
      { title: "Orders", path: "/seller/orders", icon: <ClipboardIcon className="w-5 h-5" /> },
      { title: "Checkout", path: "/checkout", icon: <ShoppingCartIcon className="w-5 h-5" /> },
    ],
    3: [
      { title: "Home", path: "/", icon: <HomeIcon className="w-5 h-5" /> },
      { title: "Products", path: "/products", icon: <ShoppingCartIcon className="w-5 h-5" /> },
      { title: "Cart", path: "/cart", icon: <ShoppingCartIcon className="w-5 h-5" /> },
      { title: "Checkout", path: "/checkout", icon: <ShoppingCartIcon className="w-5 h-5" /> },
    ],
  };

  const navLinks = linksByRole[role] || [];

  // Perfil siempre visible al inicio
  navLinks.unshift({
    title: "Perfil",
    path: "/profile",
    icon: <UserCircleIcon className="w-5 h-5" />,
  });

  return (
    <div
      className={`fixed top-0 left-0 h-screen w-64 bg-gray-900 text-white shadow-md z-40
        transform ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        transition-transform duration-300 md:translate-x-0 md:static md:block flex flex-col`}
    >
      {/* Links */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 font-bold text-xl border-b border-gray-700">Menu</div>
        <ul className="mt-4">
          {navLinks.map((link) => (
            <li key={link.title}>
              <NavLink
                to={link.path}
                onClick={toggleSidebar}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 hover:bg-gray-700 transition rounded ${
                    isActive ? "bg-blue-600" : ""
                  }`
                }
              >
                {link.icon}
                <span>{link.title}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* Logout fijo al final */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-700 rounded text-red-500"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          <span>Salir</span>
        </button>
      </div>
    </div>
  );
}
