import { useState } from "react";
import { createProductAPI } from "../../api/products";

function CrearProduct() {
  const [form, setForm] = useState({
    nombre_base: "",
    tipo_id: "",
    variante_nombre: "",
    categoria_id: "",
    presentacion_id: "",
    imagen: ""
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await createProductAPI(form);
      alert("Producto creado ID: " + res.producto_presentacion_id);
    } catch (err) {
      console.error(err);
      alert("Error al crear producto");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded shadow space-y-4">
      <h2 className="text-xl font-bold">Crear Producto</h2>
      {Object.keys(form).map(key => (
        <input
          key={key}
          name={key}
          placeholder={key.replace("_", " ")}
          value={form[key]}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
      ))}
      <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
        Crear Producto
      </button>
    </form>
  );
}

export default CrearProduct;
