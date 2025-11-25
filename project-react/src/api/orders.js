import axiosInstance from "../utils/axiosInstance";

export function getMyOrdersAPI() {
  return axiosInstance.get("/pedidos/mis-pedidos").then(res => res.data);
}

export function getOrderItemsAPI(id) {
  return axiosInstance.get(`/pedido/${id}/items`).then(res => res.data);
}

export function processOrderAPI(id, body) {
  return axiosInstance.post(`/pedido/${id}/process`, body);
}

export function adminGetPendingOrdersAPI() {
  return axiosInstance.get("/pedidos/pendientes").then(res => res.data);
}
