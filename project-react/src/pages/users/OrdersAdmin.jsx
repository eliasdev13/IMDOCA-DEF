import { useEffect, useState } from "react";
import {
  getAllOrdersAPI,
  updateOrderStatusAPI,
  processOrderAPI,
} from "../../api/orders";
import { useNavigate } from "react-router-dom";

export default function OrdersAdmin() {
  const [orders, setOrders] = useState([]);
  const [filtro, setFiltro] = useState("Todos");
  const navigate = useNavigate();

  const estados = ["Todos", "Pendiente", "Procesado", "Entregado", "Cancelado"];

  const load = () => {
    getAllOrdersAPI().then(setOrders).catch(console.error);
  };

  useEffect(load, []);

  const filtered =
    filtro === "Todos"
      ? orders
      : orders.filter((o) => o.estado_pedido === filtro);

  const getBadgeColor = (estado) => {
    const map = {
      Pendiente: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      Procesado: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      Entregado: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      Cancelado: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return map[estado] || "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-white dark:bg-gray-900 
                    rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">

      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        Gestión de pedidos
      </h1>

      {/* Filtro */}
      <div className="flex flex-wrap gap-3 mb-6">
        {estados.map((e) => (
          <button
            key={e}
            onClick={() => setFiltro(e)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border
              transition
              ${filtro === e
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-gray-100 dark:bg-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-700"
              }`}
          >
            {e}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="space-y-4">
        {filtered.map((o) => (
          <div
            key={o.pedido_id}
            className="p-5 rounded-xl shadow-md bg-gray-50 
                       dark:bg-gray-800 border border-gray-200 
                       dark:border-gray-700 hover:shadow-xl transition"
          >
            <div className="flex justify-between items-center">

              {/* INFO IZQUIERDA */}
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  Pedido #{o.pedido_id}
                </h2>

                <span
                  className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${getBadgeColor(o.estado_pedido)}`}
                >
                  {o.estado_pedido}
                </span>

                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {o.fecha_creacion.split("T")[0]}
                </p>
              </div>

              {/* ACCIONES */}
              <div className="flex flex-col sm:flex-row gap-3">

                <button
                  onClick={() => navigate(`/orders/${o.pedido_id}`)}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  Ver detalle
                </button>

                {o.estado_pedido === "Pendiente" && (
                  <button
                    onClick={() => processOrderAPI(o.pedido_id).then(load)}
                    className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
                  >
                    Procesar
                  </button>
                )}

                <select
                  value={o.estado_pedido}
                  onChange={(e) =>
                    updateOrderStatusAPI(o.pedido_id, e.target.value).then(load)
                  }
                  className="border rounded-lg p-2 bg-white dark:bg-gray-700
                             dark:border-gray-600 text-gray-800 dark:text-gray-200"
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="Procesado">Procesado</option>
                  <option value="Entregado">Entregado</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>
            </div>
          </div>
        ))}

        {!filtered.length && (
          <p className="text-center text-gray-500 dark:text-gray-300">
            No hay pedidos para este estado
          </p>
        )}
      </div>
    </div>
  );
}
