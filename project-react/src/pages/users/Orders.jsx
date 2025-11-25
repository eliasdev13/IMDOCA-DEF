import { useEffect, useState } from "react";
import { adminGetPendingOrdersAPI } from "../../api/orders";

export default function Orders() {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    adminGetPendingOrdersAPI().then(setPedidos);
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Pedidos Pendientes</h1>

      {pedidos.map((p) => (
        <div
          key={p.pedido_id}
          className="bg-white p-4 rounded shadow flex justify-between mb-4"
        >
          <div>
            <p><strong>Pedido:</strong> {p.pedido_id}</p>
            <p><strong>Cliente:</strong> {p.user_id}</p>
          </div>

          <a
            href={`/admin/pedido/${p.pedido_id}`}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Procesar
          </a>
        </div>
      ))}
    </div>
  );
}
