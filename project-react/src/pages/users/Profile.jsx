import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getProfileAPI } from "../../api/user";
import {
  EnvelopeIcon,
  UserCircleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getProfileAPI(user.accessToken);
        setProfile(data);
      } catch (err) {
        console.error("Error al cargar perfil:", err);
        setError("No se pudo cargar el perfil");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (loading)
    return (
      <p className="p-6 text-center text-gray-600 dark:text-gray-300 animate-pulse">
        Cargando perfil...
      </p>
    );

  if (error)
    return (
      <p className="p-6 text-center text-red-600 dark:text-red-400">
        {error}
      </p>
    );

  if (!profile)
    return (
      <p className="p-6 text-center text-gray-500 dark:text-gray-400">
        No se encontró el perfil.
      </p>
    );

  const initial =
    (user?.name?.charAt(0) || user?.email?.charAt(0) || "U").toUpperCase();

  return (
    <div
      className="
      max-w-3xl mx-auto mt-14 
      p-8 rounded-xl shadow-lg
      bg-white dark:bg-gray-900 
      text-gray-900 dark:text-gray-100
      border border-gray-200 dark:border-gray-700
      animate-fade-in
    "
    >
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">

        {/* Avatar */}
        <div
          className="
            w-28 h-28 rounded-full 
            bg-gradient-to-br from-blue-600 to-blue-900 
            dark:from-blue-700 dark:to-blue-950
            flex items-center justify-center
            text-4xl font-bold text-white shadow-md
          "
        >
          {initial}
        </div>

        {/* Info */}
        <div>
          <h1 className="text-3xl font-bold">{user?.name}</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Información general del usuario
          </p>
        </div>
      </div>

      {/* DATOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="flex items-center gap-3 p-4 rounded-lg 
                        bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
          <EnvelopeIcon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Correo electrónico
            </p>
            <p className="font-medium">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-lg 
                        bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
          <ShieldCheckIcon className="w-7 h-7 text-green-600 dark:text-green-400" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Rol de usuario
            </p>
            <p className="font-medium">
              {user.rol_id === 1
                ? "Administrador"
                : user.rol_id === 2
                ? "Vendedor"
                : "Cliente"}
            </p>
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <div className="mt-10 text-center text-sm text-gray-500 dark:text-gray-400">
        Última actualización:{" "}
        <span className="font-medium">
          {new Date().toLocaleString("es-CL")}
        </span>
      </div>
    </div>
  );
}
