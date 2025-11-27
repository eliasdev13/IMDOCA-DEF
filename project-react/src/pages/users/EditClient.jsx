import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getClientAPI, updateClientAPI } from "../../api/user";

export default function EditClient() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    rut: "",
    razon_social: "",
    direccion: "",
    telefono: "",
    password: "",
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getClientAPI(id)
      .then((data) => {
        setForm({
          name: data.name,
          email: data.email,
          rut: data.rut || "",
          razon_social: data.razon_social || "",
          direccion: data.direccion || "",
          telefono: data.telefono || "",
          password: "",
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = { ...form };
    if (!form.password) delete payload.password;

    try {
      await updateClientAPI(id, payload);
      setMessage("Cliente actualizado correctamente");

      setTimeout(() => navigate("/clients"), 1500);
    } catch (err) {
      setMessage(err.message || "Error al actualizar");
    }
  };

  if (loading) return <p className="p-6">Cargando cliente...</p>;

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white dark:bg-gray-900 
                    rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">

      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        Editar Cliente
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        {[
          { name: "name", label: "Nombre" },
          { name: "email", label: "Email", type: "email" },
          { name: "rut", label: "RUT" },
          { name: "razon_social", label: "Razón Social" },
          { name: "direccion", label: "Dirección" },
          { name: "telefono", label: "Teléfono" },
        ].map((f) => (
          <div key={f.name}>
            <label className="block mb-1 dark:text-gray-300">{f.label}</label>
            <input
              type={f.type || "text"}
              name={f.name}
              value={form[f.name]}
              onChange={handleChange}
              required={["name", "email", "rut"].includes(f.name)}
              className="w-full p-2 rounded-lg border dark:border-gray-700 
                         bg-gray-50 dark:bg-gray-800 text-gray-200"
            />
          </div>
        ))}

        <div>
          <label className="block mb-1 dark:text-gray-300">
            Nueva contraseña (opcional)
          </label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Dejar vacío para mantener la actual"
            className="w-full p-2 rounded-lg border dark:border-gray-700 bg-gray-800"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold"
        >
          Guardar cambios
        </button>

        {message && (
          <p className="mt-2 text-center text-green-500 dark:text-green-300">
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
