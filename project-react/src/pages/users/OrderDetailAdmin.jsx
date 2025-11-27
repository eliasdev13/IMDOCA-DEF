import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrderItemsAPI, getOrderByIdAPI } from "../../api/orders";

export default function OrderDetailAdmin() {
  const { id } = useParams();
  const [items, setItems] = useState([]);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    getOrderItemsAPI(id).then(setItems).catch(console.error);
    getOrderByIdAPI(id).then(setOrder).catch(console.error);
  }, [id]);

  if (!order) {
    return <p className="text-center mt-10">Cargando pedido...</p>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 mt-10 
                    bg-white dark:bg-gray-900 rounded-xl shadow-lg border 
                    border-gray-200 dark:border-gray-700">

      <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Pedido #{id} – Detalle
      </h1>

      {/* Información del cliente */}
      <div className="p-4 mb-6 rounded-lg bg-gray-100 dark:bg-gray-800">
        <p><strong>Cliente:</strong> {order.cliente_nombre}</p>
        <p><strong>Email:</strong> {order.cliente_email}</p>
        <p><strong>Estado:</strong> {order.estado_pedido}</p>
        <p><strong>Fecha:</strong> {order.fecha_creacion.split("T")[0]}</p>
      </div>

      {/* Tabla de productos */}
      <table className="w-full border dark:border-gray-700">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-800">
            <th className="p-2">Producto</th>
            <th className="p-2">Lote</th>
            <th className="p-2">Cantidad</th>
          </tr>
        </thead>

        <tbody>
          {items.map((i) => (
            <tr key={i.pedido_item_id} className="border-t dark:border-gray-700">
              <td className="p-2">{i.producto_base} • {i.variante}</td>
              <td className="p-2 text-center">{i.codigo_lote}</td>
              <td className="p-2 text-center">{i.cantidad_cajas}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex justify-end">
        <Link
          to="/admin/orders"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Volver
        </Link>
      </div>
    </div>
  );
}
