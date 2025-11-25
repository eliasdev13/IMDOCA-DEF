import axiosInstance from "../utils/axiosInstance";

// Obtener carrito
export function getCartAPI() {
  return axiosInstance.get("/cart").then(res => res.data);
}

// Agregar producto al carrito
export function addToCartAPI(batch_id, cantidad_cajas) {
  return axiosInstance.post("/api/cart/add", { batch_id, cantidad_cajas });
}

// Actualizar cantidad
export function updateCartItemAPI(batch_id, cantidad_cajas) {
  return axiosInstance.put("/api/cart/update", { batch_id, cantidad_cajas });
}

// Eliminar item
export function deleteCartItemAPI(batch_id) {
  return axiosInstance.delete(`/api/cart/item/${batch_id}`);
}

// Confirmar pedido
export function confirmCartAPI() {
  return axiosInstance.post("/api/cart/confirm");
}
