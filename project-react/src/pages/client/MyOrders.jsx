import { useEffect, useState } from "react";
import { getMyOrdersAPI } from "../../api/orders";
import { Link } from "react-router-dom";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    getMyOrdersAPI().then(setOrders).catch(console.error);
  }, []);

  const getBadgeColor = (estado) => {
    const map = {
      Pendiente: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      Procesado: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      Entregado: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      Cancelado: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return map[estado] || "bg-gray-200 dark:bg-gray-700";
  };

  if (!orders.length)
    return (
      <p className="mt-10 text-center text-gray-600 dark:text-gray-300">
        No tienes pedidos aún
      </p>
    );

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10 
                    bg-white dark:bg-gray-900 rounded-xl 
                    shadow-lg border border-gray-200 dark:border-gray-700">

      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        Mis pedidos
      </h1>

      <table className="w-full rounded-lg overflow-hidden border dark:border-gray-700">
        <thead className="bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
          <tr>
            <th className="p-3">ID</th>
            <th className="p-3">Estado</th>
            <th className="p-3">Fecha</th>
            <th className="p-3"></th>
          </tr>
        </thead>

        <tbody className="divide-y dark:divide-gray-700">
          {orders.map((o) => (
            <tr key={o.pedido_id} className="bg-white dark:bg-gray-900">
              <td className="p-3 text-center">{o.pedido_id}</td>

              <td className="p-3 text-center">
                <span className={`px-3 py-1 text-xs rounded-full font-semibold ${getBadgeColor(o.estado_pedido)}`}>
                  {o.estado_pedido}
                </span>
              </td>

              <td className="p-3 text-center">
                {o.fecha_creacion.slice(0, 10)}
              </td>

              <td className="p-3 text-center">
                 <Link className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  to={`/my-orders/${o.pedido_id}`}>
                  Ver
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
