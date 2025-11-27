import { useEffect, useState } from "react";
import CardProduct from "../../components/product/CardProduct";
import { getAllProductsAPI } from "../../api/products";

export default function Products() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAllProductsAPI();
        setProductos(data);
      } catch (err) {
        console.error("Error cargando productos:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading)
    return (
      <div className="text-center mt-20 text-gray-500 dark:text-gray-300 animate-pulse">
        Cargando productos...
      </div>
    );

  if (!productos.length) {
    return (
      <p className="text-center mt-10 text-gray-600 dark:text-gray-300">
        No hay productos disponibles
      </p>
    );
  }

  return (
    <div
      className="
        max-w-7xl mx-auto p-4 md:p-8
        animate-fade-in
      "
    >
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
        Productos Disponibles
      </h1>

      <div
        className="
          grid 
          grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
          gap-6
        "
      >
        {productos.map((p) => (
          <CardProduct key={p.producto_id} product={p} />
        ))}
      </div>
    </div>
  );
}
