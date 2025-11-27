import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import {
  HomeIcon,
  ShoppingCartIcon,
  UsersIcon,
  ClipboardIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  DocumentTextIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

export default function Sidebar({ isOpen, toggleSidebar }) {
  const { user, logout } = useAuth();
  const role = user?.rol_id;

  if (!user) return null;

  const links = {
    1: [
      { title: "Home", path: "/", icon: <HomeIcon className="w-5 h-5" /> },

      { title: "Products", path: "/products", icon: <ShoppingCartIcon className="w-5 h-5" /> },
      { title: "Cart", path: "/cart", icon: <ShoppingCartIcon className="w-5 h-5" /> },

      { title: "Inventory", path: "/inventory", icon: <ClipboardIcon className="w-5 h-5" /> },

      { title: "Orders Admin", path: "/admin/orders", icon: <ClipboardIcon className="w-5 h-5" /> },

      { title: "Create Product", path: "/createProduct", icon: <ClipboardIcon className="w-5 h-5" /> },

      // NUEVO MENÚ
      {
        title: "Administración Usuarios",
        path: "/admin/manage",
        icon: <UserGroupIcon className="w-5 h-5" />,
      },
    ],

    2: [
      { title: "Home", path: "/", icon: <HomeIcon className="w-5 h-5" /> },
      { title: "Products", path: "/products", icon: <ShoppingCartIcon className="w-5 h-5" /> },
      { title: "Cart", path: "/cart", icon: <ShoppingCartIcon className="w-5 h-5" /> },
      { title: "Mis Pedidos", path: "/my-orders", icon: <DocumentTextIcon className="w-5 h-5" /> },
      { title: "Inventory", path: "/inventory", icon: <ClipboardIcon className="w-5 h-5" /> },
      { title: "Orders Seller", path: "/admin/orders", icon: <ClipboardIcon className="w-5 h-5" /> },
    ],

    3: [
      { title: "Home", path: "/", icon: <HomeIcon className="w-5 h-5" /> },
      { title: "Products", path: "/products", icon: <ShoppingCartIcon className="w-5 h-5" /> },
      { title: "Cart", path: "/cart", icon: <ShoppingCartIcon className="w-5 h-5" /> },
      { title: "Mis Pedidos", path: "/my-orders", icon: <DocumentTextIcon className="w-5 h-5" /> },
    ],
  };

  const navLinks = [
    { title: "Perfil", path: "/profile", icon: <UserCircleIcon className="w-5 h-5" /> },
    ...links[role],
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 
      shadow-xl border-r border-gray-200 dark:border-gray-700
      transform ${isOpen ? "translate-x-0" : "-translate-x-full"}
      transition-transform duration-300 ease-in-out
      md:translate-x-0 md:static`}
    >
      <div className="p-4 text-xl font-semibold border-b border-gray-200 dark:border-gray-700">
        Menú
      </div>

      <ul className="mt-2 px-2 space-y-1">
        {navLinks.map((link) => (
          <li key={link.path}>
            <NavLink
              to={link.path}
              onClick={toggleSidebar}
              className={({ isActive }) =>
                `
                flex items-center gap-3 px-4 py-3 rounded-lg
                hover:bg-gray-200 dark:hover:bg-gray-800 transition
                ${isActive ? "bg-blue-600 text-white" : ""}
              `
              }
            >
              {link.icon}
              <span>{link.title}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-4 py-2 rounded-lg
            bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 
            hover:bg-red-200 dark:hover:bg-red-800 transition"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          Salir
        </button>
      </div>
    </aside>
  );
}
