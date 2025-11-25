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
    rol_id: 1, // default Admin
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

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
    <div className="p-6 max-w-md mx-auto bg-white rounded shadow-md">
      <h2 className="text-xl font-bold mb-4">Crear Usuario</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          name="name"
          placeholder="Nombre"
          value={formData.name}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <select
          name="rol_id"
          value={formData.rol_id}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value={1}>Admin</option>
          <option value={2}>Vendedor</option>
        </select>
        <button type="submit" className="bg-blue-600 text-white p-2 rounded">
          Crear Usuario
        </button>
        {message && <p className="mt-2 text-red-500">{message}</p>}
      </form>
    </div>
  );
}
