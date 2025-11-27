// src/pages/client/Cart.jsx
import { useEffect, useState } from "react";
import {
  getCartAPI,
  removeItemFromCartAPI,
  clearCartAPI,
  confirmCartAPI,
} from "../../api/cart";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  const loadCart = async () => {
    try {
      const data = await getCartAPI();
      setItems(data);
    } catch (err) {
      console.error("Error cargando carrito:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const remove = async (id) => {
    try {
      await removeItemFromCartAPI(id);
      await loadCart();
    } catch (err) {
      alert("Error eliminando producto");
    }
  };

  const clear = async () => {
    try {
      await clearCartAPI();
      setItems([]); // Limpia inmediatamente
    } catch {
      alert("Error vaciando carrito");
    }
  };

  const confirm = async () => {
    if (processing) return;
    setProcessing(true);

    try {
      const res = await confirmCartAPI();

      if (!res.pedidoId) {
        alert("Pedido creado pero sin ID devuelto.");
      } else {
        alert("Pedido creado correctamente: #" + res.pedidoId);
      }

      navigate("/my-orders");
    } catch (err) {
      console.error("Error al confirmar:", err);

      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Error al confirmar pedido";

      alert(msg);
    }

    setProcessing(false);
  };

  if (loading) return <p className="text-center mt-10">Cargando...</p>;

  if (!items.length)
    return <p className="text-center mt-10">Carrito vacío</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded shadow mt-6">
      <h1 className="text-2xl font-bold mb-4">Carrito</h1>

      <table className="w-full border dark:border-gray-700">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700">
            <th className="p-3">Producto</th>
            <th className="p-3">Lote</th>
            <th className="p-3">Cant.</th>
            <th className="p-3">Stock</th>
            <th className="p-3"></th>
          </tr>
        </thead>

        <tbody>
          {items.map((i) => (
            <tr key={i.carrito_item_id} className="border-t dark:border-gray-700">
              <td className="p-3">{i.producto_base} — {i.variante}</td>
              <td className="p-3">{i.codigo_lote}</td>
              <td className="p-3">{i.cantidad_cajas}</td>
              <td className="p-3">{i.stock_cajas}</td>

              <td className="p-3 text-right">
                <button
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                  onClick={() => remove(i.carrito_item_id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between mt-6">
        <button
          onClick={clear}
          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded"
        >
          Vaciar carrito
        </button>

        <button
          onClick={confirm}
          disabled={processing}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          {processing ? "Procesando..." : "Confirmar pedido"}
        </button>
      </div>
    </div>
  );
}
