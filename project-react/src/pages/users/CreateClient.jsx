// src/pages/users/CreateClient.jsx
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { createClientAPI } from "../../api/user";

export default function CreateClient() {
  const { user } = useAuth();
  const token = user.accessToken;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    rut: "",
    razon_social: "",
    direccion: "",
    telefono: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await createClientAPI(formData, token);
      setMessage(res.message);

      setFormData({
        name: "",
        email: "",
        password: "",
        rut: "",
        razon_social: "",
        direccion: "",
        telefono: "",
      });
    } catch (err) {
      setMessage(err.message || "Error creando cliente");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white dark:bg-gray-900 
                    rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">

      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        Crear Cliente
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* CAMPOS */}
        {[
          { name: "name", label: "Nombre" },
          { name: "email", label: "Email", type: "email" },
          { name: "password", label: "Contraseña", type: "password" },
          { name: "rut", label: "RUT" },
          { name: "razon_social", label: "Razón Social" },
          { name: "direccion", label: "Dirección" },
          { name: "telefono", label: "Teléfono" },
        ].map((field) => (
          <div key={field.name}>
            <label className="block mb-1 text-gray-700 dark:text-gray-300">
              {field.label}
            </label>
            <input
              type={field.type || "text"}
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 
                         bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-200 
                         focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        ))}

        {/* BOTÓN */}
        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white 
                     py-2 rounded-lg transition font-semibold"
        >
          Crear Cliente
        </button>

        {/* MENSAJE */}
        {message && (
          <p className="mt-2 text-center text-blue-600 dark:text-blue-300 font-medium">
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
