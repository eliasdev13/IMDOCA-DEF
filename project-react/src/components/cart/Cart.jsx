import { useEffect, useState } from "react";
import {
  getCartAPI,
  updateCartItemAPI,
  deleteCartItemAPI,
  confirmCartAPI
} from "../../api/cart";

export default function Cart() {
  const [carrito, setCarrito] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    getCart();
  }, []);

  const getCart = async () => {
    setCargando(true);
    try {
      const data = await getCartAPI();
      setCarrito(data);
    } catch (error) {
      console.error(error);
    }
    setCargando(false);
  };

  const actualizarCantidad = async (batch_id, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    await updateCartItemAPI(batch_id, nuevaCantidad);
    getCart();
  };

  const eliminarItem = async (batch_id) => {
    await deleteCartItemAPI(batch_id);
    getCart();
  };

  const confirmarPedido = async () => {
    await confirmCartAPI();
    alert("Pedido confirmado y enviado a la bodega");
    getCart();
  };

  if (cargando) return <p className="mt-10 text-center">Cargando carrito...</p>;
  if (!carrito || carrito.items.length === 0)
    return <p className="mt-10 text-center">Tu carrito está vacío</p>;

  const total = carrito.items.reduce(
    (acc, item) => acc + item.cantidad_cajas * (item.precio || 0),
    0
  );

  return (
    <div className="max-w-4xl mx-auto p-6 mt-6 bg-white shadow rounded-xl">
      <h1 className="text-2xl font-bold mb-4">Tu Carrito</h1>

      {/* Tabla */}
      <div className="w-full overflow-x-auto">
        <table className="w-full mt-4">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2">Producto</th>
              <th>Cantidad</th>
              <th>Precio</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {carrito.items.map((item) => (
              <tr key={item.batch_id} className="border-b hover:bg-gray-50">
                <td className="py-3">
                  <div className="font-semibold">{item.producto_base}</div>
                  <div className="text-gray-500 text-sm">{item.variante}</div>
                  <div className="text-gray-400 text-xs">Lote: {item.codigo_lote}</div>
                </td>

                <td>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        actualizarCantidad(item.batch_id, item.cantidad_cajas - 1)
                      }
                      className="px-2 bg-gray-300 rounded"
                    >
                      -
                    </button>
                    <span>{item.cantidad_cajas}</span>
                    <button
                      onClick={() =>
                        actualizarCantidad(item.batch_id, item.cantidad_cajas + 1)
                      }
                      className="px-2 bg-gray-300 rounded"
                    >
                      +
                    </button>
                  </div>
                </td>

                <td>${item.precio || 0}</td>

                <td className="font-semibold">
                  ${item.cantidad_cajas * (item.precio || 0)}
                </td>

                <td>
                  <button
                    onClick={() => eliminarItem(item.batch_id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total */}
        <div className="text-right mt-4 text-xl font-bold">
          Total: ${total}
        </div>

        {/* Confirmar */}
        <button
          onClick={confirmarPedido}
          className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Confirmar pedido
        </button>
      </div>
    </div>
  );
}
