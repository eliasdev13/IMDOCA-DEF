import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getProfileAPI } from "../../api/user";

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

  if (loading) return <p className="p-4">Cargando perfil...</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;
  if (!profile) return <p className="p-4">No se encontró el perfil</p>;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4">Mi Perfil</h1>
      <p><strong>Nombre:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Rol:</strong> {user.rol_id}</p>
    </div>
  );
}
