import { useEffect, useState } from "react";
import CardProduct from "../../components/product/CardProduct";
import { getAllProductsAPI } from "../../api/products";

export default function Products() {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    getAllProductsAPI()
      .then(setProductos)
      .catch(console.error);
  }, []);

  if (!productos.length) {
    return <p className="text-center mt-10">No hay productos disponibles</p>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {productos.map((p) => (
        <div key={p.producto_id} className="flex">
          <CardProduct product={p} />
        </div>
      ))}
    </div>
  );

}
