import { useEffect, useState } from "react";
import { ingresarMercaderiaAPI } from "../../api/inventory";
import axiosInstance from "../../utils/axiosInstance";

export default function IngresarMercaderia() {
  const [productos, setProductos] = useState([]);
  const [bodegas, setBodegas] = useState([]);
  const [form, setForm] = useState({
    producto_presentacion_codigo_id: "",
    bodega_id: "",
    codigo_lote: "",
    fecha_elaboracion: "",
    fecha_vencimiento: "",
    cantidad_cajas: "",
    guia_despacho: "",
    factura_proveedor: "",
    codigo_datador: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    axiosInstance.get("/productos/presentaciones-cajas").then(res => setProductos(res.data));
    axiosInstance.get("/bodega").then(res => setBodegas(res.data));
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();

    try {
      const res = await ingresarMercaderiaAPI(form);
      setMessage("Ingreso realizado correctamente (batch: " + res.batch_id + ")");
    } catch (err) {
      console.error(err);
      setMessage("Error al ingresar");
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Ingresar Mercadería</h2>

      <form onSubmit={submit} className="space-y-4">

        {/* Producto */}
        <div>
          <label>Producto (caja EAN14)</label>
          <select
            name="producto_presentacion_codigo_id"
            value={form.producto_presentacion_codigo_id}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Seleccione...</option>
            {productos.map((p) => (
              <option key={p.ppc_id} value={p.ppc_id}>
                {p.producto_base} — {p.variante} — {p.presentacion} — {p.ean14}
              </option>
            ))}
          </select>
        </div>

        {/* Bodega */}
        <div>
          <label>Bodega</label>
          <select
            name="bodega_id"
            value={form.bodega_id}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Seleccione...</option>
            {bodegas.map((b) => (
              <option key={b.bodega_id} value={b.bodega_id}>
                {b.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Lote */}
        <div>
          <label>Código Lote</label>
          <input
            name="codigo_lote"
            className="w-full p-2 border rounded"
            value={form.codigo_lote}
            onChange={handleChange}
            required
          />
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Fecha elaboración</label>
            <input type="date" name="fecha_elaboracion"
              className="w-full p-2 border rounded"
              value={form.fecha_elaboracion}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Fecha vencimiento</label>
            <input type="date" name="fecha_vencimiento"
              className="w-full p-2 border rounded"
              value={form.fecha_vencimiento}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Cantidad */}
        <div>
          <label>Cantidad cajas</label>
          <input
            type="number"
            name="cantidad_cajas"
            className="w-full p-2 border rounded"
            value={form.cantidad_cajas}
            onChange={handleChange}
            required
          />
        </div>

        {/* Datos opcionales */}
        <input name="guia_despacho" placeholder="Guía de despacho" className="w-full p-2 border rounded" onChange={handleChange} />
        <input name="factura_proveedor" placeholder="Factura proveedor" className="w-full p-2 border rounded" onChange={handleChange} />
        <input name="codigo_datador" placeholder="Código datador" className="w-full p-2 border rounded" onChange={handleChange} />

        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded">
          Ingresar mercadería
        </button>

        {message && <p className="text-center mt-4">{message}</p>}
      </form>
    </div>
  );
}
