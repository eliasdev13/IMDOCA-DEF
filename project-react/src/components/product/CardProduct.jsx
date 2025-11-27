import { useNavigate } from "react-router-dom";
import ProductImage from "./ProductImage";

export default function CardProduct({ product }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/product/${product.producto_id}`)}
      className="
        cursor-pointer
        rounded-xl overflow-hidden
        bg-white dark:bg-gray-800
        shadow-lg dark:shadow-gray-900/40
        border border-gray-200 dark:border-gray-700
        hover:shadow-xl hover:-translate-y-1
        transition-all duration-300
      "
    >
      <ProductImage
        imagen_url={product.imagen}
        nombre={product.producto_base}
        size="card"
      />

      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {product.producto_base}
        </h3>

        <p className="text-gray-600 dark:text-gray-300 text-sm">
          {product.variante}
        </p>

        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
          EAN14: <span className="font-mono">{product.ean14}</span>
        </p>

        {product.stock_cajas != null ? (
          <p className="mt-3 text-green-600 dark:text-green-400 font-semibold">
            Stock: {product.stock_cajas} cajas
          </p>
        ) : (
          <p className="mt-3 text-red-600 dark:text-red-400 font-semibold">
            Sin stock
          </p>
        )}
      </div>
    </div>
  );
}
