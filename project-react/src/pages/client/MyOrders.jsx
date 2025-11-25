import { useEffect, useState } from "react";
import { getMyOrdersAPI } from "../../api/orders";

export default function MyOrders() {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    getMyOrdersAPI().then(setPedidos);
  }, []);

  if (!pedidos.length)
    return <p className="text-center mt-10">No tienes pedidos aún</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Mis Pedidos</h1>

      {pedidos.map((p) => (
        <div key={p.pedido_id} className="bg-white shadow rounded p-4 mb-4">
          <p><strong>ID:</strong> {p.pedido_id}</p>
          <p><strong>Estado:</strong> {p.estado_pedido}</p>
          <p><strong>Fecha:</strong> {new Date(p.fecha_creacion).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
