import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProductByIdAPI } from "../../api/products";
import { addToCartAPI } from "../../api/cart";
import ProductImage from "../../components/product/ProductImage";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [cantidad, setCantidad] = useState(1);

  useEffect(() => {
    getProductByIdAPI(id)
      .then((data) => {
        setProduct(data);
        console.log("Producto recibido:", data);
      })
      .catch(console.error);
  }, [id]);

  if (!product) return <p className="mt-10 text-center">Cargando...</p>;

  // Validaciones
  const tieneBatch = !!product.batch_id;
  const stockDisponible = product.stock_cajas ?? null;

  const addCart = async () => {
    if (!tieneBatch) {
      alert("Este producto no tiene lote disponible.");
      return;
    }

    if (stockDisponible !== null && cantidad > stockDisponible) {
      alert("No hay stock suficiente del lote seleccionado.");
      return;
    }

    try {
      await addToCartAPI(product.batch_id, cantidad);
      alert("Producto agregado al carrito");
    } catch (error) {
      console.error(error);
      alert("Error al agregar al carrito");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow mt-6">

      {/* Imagen principal */}
      <ProductImage
        imagen_url={product.imagen}
        nombre={product.producto_base}
        size="detail"
      />

      {/* Título */}
      <h1 className="text-3xl font-bold mt-6">{product.producto_base}</h1>

      {/* Información del producto */}
      <p className="text-gray-600 mt-2">{product.variante}</p>

      <p className="text-gray-500 mt-1">
        <span className="font-semibold">Presentación:</span> {product.presentacion}
      </p>

      <p className="text-gray-500 mt-1">
        <span className="font-semibold">EAN14:</span> {product.ean14}
      </p>

      {/* Información del Lote */}
      {tieneBatch ? (
        <>
          <p className="text-gray-500 mt-1">
            <span className="font-semibold">Código de lote:</span> {product.codigo_lote}
          </p>

          {stockDisponible !== null && (
            <p className="text-gray-600 mt-1 font-semibold">
              Stock disponible: {stockDisponible} cajas
            </p>
          )}
        </>
      ) : (
        <p className="text-red-500 mt-4 font-bold">
          Sin lote disponible (no se puede agregar al carrito)
        </p>
      )}

      {/* Selección de cantidad */}
      {tieneBatch && (
        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={() => setCantidad((c) => Math.max(1, c - 1))}
            className="bg-gray-300 px-3 py-1 rounded"
          >
            -
          </button>
          <span className="text-lg font-semibold">{cantidad}</span>
          <button
            onClick={() => setCantidad((c) => c + 1)}
            className="bg-gray-300 px-3 py-1 rounded"
          >
            +
          </button>
        </div>
      )}

      {/* Botón agregar */}
      <button
        onClick={addCart}
        disabled={!tieneBatch}
        className={`mt-6 w-full py-3 rounded-lg text-white text-lg transition 
          ${tieneBatch ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"}
        `}
      >
        Agregar al carrito
      </button>
    </div>
  );
}
