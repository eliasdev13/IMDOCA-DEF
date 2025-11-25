import { useEffect, useState } from "react";
import { getOrderItemsAPI, processOrderAPI } from "../../api/orders";
import { useParams } from "react-router-dom";

export default function ProcessOrder() {
  const { id } = useParams();
  const [items, setItems] = useState([]);

  useEffect(() => {
    getOrderItemsAPI(id).then(setItems);
  }, [id]);

  const procesar = async () => {
    await processOrderAPI(id, {
      bodega_id: 1,
      responsable_salida: "Admin",
      comentario: "Despacho normal",
    });
    alert("Pedido procesado y stock descontado");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded mt-6">
      <h1 className="text-2xl font-bold mb-4">
        Procesar Pedido #{id}
      </h1>

      {items.map((i) => (
        <div key={i.pedido_item_id} className="border-b py-3">
          <p className="font-semibold">{i.producto_base}</p>
          <p>Cajas: {i.cantidad_cajas}</p>
          <p>Lote: {i.codigo_lote}</p>
        </div>
      ))}

      <button
        onClick={procesar}
        className="mt-6 w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
      >
        PROCESAR Y DESCONTAR STOCK
      </button>
    </div>
  );
}
