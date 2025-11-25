import { useEffect, useState } from "react";
import { getProductByIdAPI } from "../../api/products";

export function useProductImage(producto_id) {
  const [imagen, setImagen] = useState(null);

  useEffect(() => {
    if (!producto_id) return;

    getProductByIdAPI(producto_id)
      .then((data) => {
        // data.imagen viene del backend
        setImagen(data.imagen);
      })
      .catch(() => setImagen(null));
  }, [producto_id]);

  return imagen;
}
