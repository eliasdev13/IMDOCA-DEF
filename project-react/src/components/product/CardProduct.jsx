import { useNavigate } from "react-router-dom";
import ProductImage from "./ProductImage";

export default function CardProduct({ product }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/product/${product.producto_id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="w-full max-w-sm md:max-w-full
                 flex flex-col md:flex-row items-center md:items-start
                 gap-4 p-5 bg-white rounded-xl shadow hover:shadow-xl
                 transition cursor-pointer"
    >
      {/* Imagen con ancho controlado */}
      <div className="flex-shrink-0">
        <ProductImage
          imagen_url={product.imagen}
          nombre={product.producto_base}
          size="card"
        />
      </div>

      {/* Texto alineado y contenido */}
      <div className="flex-1 text-center md:text-left">
        <h2 className="text-lg font-bold text-gray-800">
          {product.producto_base}
        </h2>

        <p className="text-gray-600 text-sm">{product.variante}</p>

        {product.presentacion && (
          <p className="text-gray-500 text-sm">
            Presentación: {product.presentacion}
          </p>
        )}

        {product.ean14 && (
          <p className="text-gray-500 text-sm">EAN14: {product.ean14}</p>
        )}
      </div>
    </div>
  );
}
