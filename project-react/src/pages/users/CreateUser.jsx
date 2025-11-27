import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { createUserAPI } from "../../api/user";

export default function CreateUser() {
  const { user } = useAuth();
  const token = user.accessToken;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    rol_id: 1,
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await createUserAPI(formData, token);
      setMessage(res.message);

      setFormData({ name: "", email: "", password: "", rol_id: 1 });
    } catch (err) {
      setMessage(err.message || "Error creando usuario");
    }
  };

  return (
    <div
      className="
        max-w-xl mx-auto mt-12 p-8
        bg-white dark:bg-gray-900
        rounded-2xl shadow-xl
        border border-gray-200 dark:border-gray-700
        animate-fade-in
      "
    >
      <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
        Crear Usuario
      </h2>

      <form className="space-y-6" onSubmit={handleSubmit}>
        
        {/* Nombre */}
        <div>
          <label className="block mb-1 text-gray-700 dark:text-gray-300 font-medium">
            Nombre
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="
              w-full px-4 py-2.5
              rounded-lg border border-gray-300 dark:border-gray-700
              bg-gray-50 dark:bg-gray-800
              text-gray-900 dark:text-gray-200
              focus:ring-2 focus:ring-blue-600 focus:outline-none
            "
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block mb-1 text-gray-700 dark:text-gray-300 font-medium">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="
              w-full px-4 py-2.5
              rounded-lg border border-gray-300 dark:border-gray-700
              bg-gray-50 dark:bg-gray-800
              text-gray-900 dark:text-gray-200
              focus:ring-2 focus:ring-blue-600 focus:outline-none
            "
            required
          />
        </div>

        {/* Password */}
        <div>
          <label className="block mb-1 text-gray-700 dark:text-gray-300 font-medium">
            Contraseña
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="
              w-full px-4 py-2.5
              rounded-lg border border-gray-300 dark:border-gray-700
              bg-gray-50 dark:bg-gray-800
              text-gray-900 dark:text-gray-200
              focus:ring-2 focus:ring-blue-600 focus:outline-none
            "
            required
          />
        </div>

        {/* Rol */}
        <div>
          <label className="block mb-1 text-gray-700 dark:text-gray-300 font-medium">
            Rol
          </label>
          <select
            name="rol_id"
            value={formData.rol_id}
            onChange={handleChange}
            className="
              w-full px-4 py-2.5
              rounded-lg border border-gray-300 dark:border-gray-700
              bg-gray-50 dark:bg-gray-800
              text-gray-900 dark:text-gray-200
              focus:ring-2 focus:ring-blue-600 focus:outline-none
            "
          >
            <option value={1}>Administrador</option>
            <option value={2}>Vendedor</option>
          </select>
        </div>

        {/* Botón */}
        <button
          type="submit"
          className="
            w-full py-3 rounded-lg
            bg-blue-600 hover:bg-blue-700
            text-white font-semibold tracking-wide
            transition shadow
          "
        >
          Crear Usuario
        </button>

        {message && (
          <p className="text-center text-blue-600 dark:text-blue-300 mt-3">
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
