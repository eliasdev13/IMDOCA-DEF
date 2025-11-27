import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProductByIdAPI } from "../../api/products";
import { addToCartAPI } from "../../api/cart";
import ProductImage from "../../components/product/ProductImage";

export default function ProductDetail() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [batch, setBatch] = useState(null); // lote seleccionado
  const [cantidad, setCantidad] = useState(1);

  useEffect(() => {
    getProductByIdAPI(id)
      .then((data) => {
        setProduct(data);
        if (data.lotes && data.lotes.length > 0) {
          setBatch(data.lotes[0]); // selecciona el primer lote automáticamente
        }
      })
      .catch(console.error);
  }, [id]);

  if (!product)
    return (
      <p className="mt-10 text-center text-gray-600 dark:text-gray-300">
        Cargando...
      </p>
    );

  const agregarCarrito = async () => {
    if (!batch) return alert("Debes seleccionar un lote.");
    if (cantidad > batch.stock_cajas)
      return alert("La cantidad supera el stock del lote seleccionado.");

    try {
      await addToCartAPI(batch.batch_id, cantidad);
      alert("Producto agregado al carrito ✔");
    } catch (err) {
      console.error(err);
      alert("Error al agregar al carrito");
    }
  };

  return (
    <div
      className="max-w-5xl mx-auto mt-10 p-6 
                 bg-white dark:bg-gray-900 
                 rounded-xl shadow-lg border 
                 border-gray-200 dark:border-gray-700
                 animate-fade-in"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Imagen del producto */}
        <div className="flex justify-center items-start">
          <ProductImage 
            imagen_url={product.imagen} 
            nombre={product.producto_base} 
            size="detail" 
          />
        </div>

        <div>
          {/* NOMBRE */}
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            {product.producto_base}
          </h1>

          {/* VARIANTE */}
          <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
            {product.variante}
          </p>

          {/* BADGES */}
          <div className="flex items-center gap-3 mt-4">
            {product.lotes?.length > 0 ? (
              <span className="px-3 py-1 text-sm rounded-full font-semibold 
                               bg-green-100 text-green-800
                               dark:bg-green-900 dark:text-green-200">
                Lotes disponibles
              </span>
            ) : (
              <span className="px-3 py-1 text-sm rounded-full font-semibold 
                               bg-red-100 text-red-800 
                               dark:bg-red-900 dark:text-red-200">
                Sin lotes
              </span>
            )}
          </div>

          {/* DATOS ESTÁTICOS */}
          <div className="mt-6 space-y-2 text-gray-700 dark:text-gray-300 text-lg">
            <p>
              <strong className="text-gray-900 dark:text-white">Presentación:</strong>{" "}
              {product.presentacion}
            </p>

            <p>
              <strong className="text-gray-900 dark:text-white">EAN14:</strong>{" "}
              {product.ean14}
            </p>
          </div>

          {/* SELECCIÓN DE LOTE */}
          <div className="mt-6">
            <label className="block text-gray-800 dark:text-gray-200 font-semibold mb-1">
              Seleccionar lote
            </label>

            <select
              className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
              value={batch ? batch.batch_id : ""}
              onChange={(e) => {
                const selected = product.lotes.find(
                  (l) => l.batch_id === Number(e.target.value)
                );
                setBatch(selected);
                setCantidad(1);
              }}
            >
              {product.lotes?.length > 0 ? (
                product.lotes.map((l) => (
                  <option key={l.batch_id} value={l.batch_id}>
                    {l.codigo_lote} — Stock {l.stock_cajas}
                  </option>
                ))
              ) : (
                <option>No hay lotes disponibles</option>
              )}
            </select>
          </div>

          {/* INFO DEL LOTE */}
          {batch && (
            <div className="mt-4 text-lg text-gray-700 dark:text-gray-300 space-y-2">
              <p>
                <strong>Lote:</strong> {batch.codigo_lote}
              </p>
              <p>
                <strong>Stock:</strong> {batch.stock_cajas} cajas
              </p>
              <p>
                <strong>Vencimiento:</strong> {batch.fecha_vencimiento}
              </p>
            </div>
          )}

          {/* SELECCIÓN DE CANTIDAD */}
          {batch && batch.stock_cajas > 0 && (
            <div className="flex items-center gap-4 mt-8">
              <button
                className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 
                           text-xl flex items-center justify-center
                           hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                onClick={() => setCantidad((c) => Math.max(1, c - 1))}
              >
                −
              </button>

              <span className="text-2xl font-bold dark:text-white">{cantidad}</span>

              <button
                className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700
                           text-xl flex items-center justify-center
                           hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                onClick={() => {
                  if (cantidad < batch.stock_cajas) setCantidad(cantidad + 1);
                }}
              >
                +
              </button>
            </div>
          )}

          {/* BOTÓN AGREGAR */}
          <button
            onClick={agregarCarrito}
            disabled={!batch || batch.stock_cajas === 0}
            className={`mt-8 w-full py-4 rounded-xl text-xl font-semibold text-white shadow-md transition 
              ${
                batch && batch.stock_cajas > 0
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-400 cursor-not-allowed"
              }
            `}
          >
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  );
}
