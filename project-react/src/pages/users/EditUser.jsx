import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserAPI, updateUserAPI } from "../../api/user";

export default function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    rol_id: 2,
    password: "",
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getUserAPI(id)
      .then((data) => {
        setForm({
          name: data.name,
          email: data.email,
          rol_id: data.rol_id,
          password: "",
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = { ...form };
      if (!form.password) delete payload.password;

      await updateUserAPI(id, payload);

      setMessage("Usuario actualizado correctamente");
      setTimeout(() => navigate("/users"), 1500);
    } catch (err) {
      setMessage(err.message || "Error al actualizar");
    }
  };

  if (loading) return <p className="p-6">Cargando...</p>;

  // ⚠️ Bloquear si es cliente
  if (form.rol_id === 3) {
    return (
      <div className="max-w-lg mx-auto mt-10 p-6 rounded-xl bg-white dark:bg-gray-900 border">
        <h2 className="text-2xl font-bold text-red-500 mb-4">
          Este usuario es Cliente
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Los clientes deben editarse en su módulo correspondiente porque 
          tienen información extra (rut, dirección, etc.).
        </p>

        <button
          onClick={() => navigate(`/clients/${id}`)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
        >
          Ir a editar cliente
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white dark:bg-gray-900 
                    rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">

      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        Editar Usuario
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Nombre */}
        <div>
          <label className="block mb-1 dark:text-gray-300">Nombre</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full p-2 rounded-lg border dark:border-gray-700 bg-gray-50 
                       dark:bg-gray-800 text-gray-900 dark:text-gray-200"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block mb-1 dark:text-gray-300">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full p-2 rounded-lg border dark:border-gray-700 bg-gray-50 
                       dark:bg-gray-800 text-gray-900 dark:text-gray-200"
            required
          />
        </div>

        {/* Rol: solo Admin y Vendedor */}
        <div>
          <label className="block mb-1 dark:text-gray-300">Rol</label>
          <select
            name="rol_id"
            value={form.rol_id}
            onChange={handleChange}
            className="w-full p-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
          >
            <option value={1}>Administrador</option>
            <option value={2}>Vendedor</option>
          </select>
        </div>

        {/* Contraseña */}
        <div>
          <label className="block mb-1 dark:text-gray-300">Nueva contraseña (opcional)</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Dejar vacío para mantener la actual"
            className="w-full p-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition font-semibold"
        >
          Guardar cambios
        </button>

        {message && (
          <p className="mt-2 text-center text-blue-600 dark:text-blue-300 font-medium">
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
