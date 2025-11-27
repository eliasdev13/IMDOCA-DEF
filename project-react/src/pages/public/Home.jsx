import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";

import {
  getPedidosHoyAPI,
  getClientesActivosAPI,
  getProductosAPI,
  getUltimosPedidosAPI,
  getStockBajoAPI,
} from "../../api/dashboard";

export default function Home() {
  const { user } = useAuth();

  const [pedidosHoy, setPedidosHoy] = useState(0);
  const [clientesActivos, setClientesActivos] = useState(0);
  const [productosTotal, setProductosTotal] = useState(0);
  const [ultimosPedidos, setUltimosPedidos] = useState([]);
  const [stockBajo, setStockBajo] = useState([]);

  useEffect(() => {
    getPedidosHoyAPI().then((d) => setPedidosHoy(d.total));
    getClientesActivosAPI().then((d) => setClientesActivos(d.total));
    getProductosAPI().then((d) => setProductosTotal(d.total));
    getUltimosPedidosAPI().then(setUltimosPedidos);
    getStockBajoAPI().then(setStockBajo);
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">

      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        Bienvenido, {user.name}
      </h1>

      {/* MÉTRICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">

        <div className="p-6 rounded-xl bg-white dark:bg-gray-900 shadow border 
                        border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-300">Pedidos Hoy</p>
          <h2 className="text-3xl font-bold mt-2 text-blue-600">{pedidosHoy}</h2>
        </div>

        <div className="p-6 rounded-xl bg-white dark:bg-gray-900 shadow border 
                        border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-300">Clientes Activos</p>
          <h2 className="text-3xl font-bold mt-2 text-green-600">{clientesActivos}</h2>
        </div>

        <div className="p-6 rounded-xl bg-white dark:bg-gray-900 shadow border 
                        border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-300">Productos</p>
          <h2 className="text-3xl font-bold mt-2 text-purple-600">{productosTotal}</h2>
        </div>

      </div>

      {/* SECCIONES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ÚLTIMOS PEDIDOS */}
        <div className="bg-white dark:bg-gray-900 shadow rounded-xl p-6 border 
                        border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Últimos pedidos</h2>

          <ul className="divide-y dark:divide-gray-700">
            {ultimosPedidos.map((p) => (
              <li key={p.pedido_id} className="py-3 flex justify-between">
                <span className="dark:text-gray-300">Pedido #{p.pedido_id}</span>
                <span className="text-sm bg-blue-600 text-white px-3 py-1 rounded-full">
                  {p.estado_pedido}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* STOCK BAJO */}
        <div className="bg-white dark:bg-gray-900 shadow rounded-xl p-6 border 
                        border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Stock bajo</h2>

          {stockBajo.length === 0 ? (
            <p className="text-gray-400">Todo el inventario está en buen nivel.</p>
          ) : (
            <div className="space-y-3">
              {stockBajo.map((p) => (
                <div key={p.producto_base_id}
                  className="p-3 rounded-lg flex justify-between bg-red-100 dark:bg-red-900">
                  <span className="dark:text-gray-200">{p.producto}</span>
                  <span className="font-bold text-red-700 dark:text-red-300">
                    {p.stock_cajas} cajas
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
