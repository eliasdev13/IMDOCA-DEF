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

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await createClientAPI(formData, token);
      setMessage(res.message);
      setFormData({ name: "", email: "", password: "", rut: "", razon_social: "", direccion: "", telefono: "" });
    } catch (err) {
      setMessage(err.message || "Error creando cliente");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded shadow-md">
      <h2 className="text-xl font-bold mb-4">Crear Cliente</h2>
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
        <input
          type="text"
          name="rut"
          placeholder="RUT"
          value={formData.rut}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          name="razon_social"
          placeholder="Razón Social"
          value={formData.razon_social}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          name="direccion"
          placeholder="Dirección"
          value={formData.direccion}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          name="telefono"
          placeholder="Teléfono"
          value={formData.telefono}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <button type="submit" className="bg-green-600 text-white p-2 rounded">
          Crear Cliente
        </button>
        {message && <p className="mt-2 text-red-500">{message}</p>}
      </form>
    </div>
  );
}
