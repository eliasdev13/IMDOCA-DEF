import { useEffect, useState } from "react";
import { getOrderItemsAPI } from "../../api/orders";
import { Link, useParams } from "react-router-dom";

export default function OrderDetail() {
  const { id } = useParams();
  const [items, setItems] = useState([]);

  useEffect(() => {
    getOrderItemsAPI(id).then(setItems).catch(console.error);
  }, [id]);

  if (!items.length)
    return (
      <p className="text-center mt-10 text-gray-600 dark:text-gray-300">
        Este pedido no tiene ítems
      </p>
    );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 
                    shadow rounded-xl mt-6 border border-gray-200 dark:border-gray-700">

      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Detalle del Pedido #{id}
      </h1>

      <table className="w-full border dark:border-gray-700">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-800">
            <th className="p-2 text-left">Producto</th>
            <th className="p-2 text-center">Lote</th>
            <th className="p-2 text-center">Cantidad</th>
          </tr>
        </thead>

        <tbody>
          {items.map((i) => (
            <tr
              key={i.pedido_item_id}
              className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <td className="p-2">
                <strong>{i.producto_base}</strong> • {i.variante}
              </td>
              <td className="p-2 text-center">{i.codigo_lote}</td>
              <td className="p-2 text-center">{i.cantidad_cajas}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Volver */}
      <div className="mt-6 flex justify-end">
        <Link
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          to="/my-orders"
        >
          Volver
        </Link>
      </div>
    </div>
  );
}
