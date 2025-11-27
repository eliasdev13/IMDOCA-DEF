// src/api/orders.js
import axiosInstance from "../utils/axiosInstance";

// Cliente – lista de pedidos
export const getMyOrdersAPI = async () => {
  const res = await axiosInstance.get("/pedidos/my-orders");
  return res.data;
};

// Cliente – items de pedido
export const getOrderItemsAPI = async (pedidoId) => {
  const res = await axiosInstance.get(`/pedidos/${pedidoId}/items`);
  return res.data;
};

// Admin/Seller
export const getAllOrdersAPI = async () => {
  const res = await axiosInstance.get("/admin/orders");
  return res.data;
};

export const updateOrderStatusAPI = async (pedidoId, estado) => {
  const res = await axiosInstance.put(`/admin/pedido/${pedidoId}/status`, { estado });
  return res.data;
};

export const processOrderAPI = async (pedidoId) => {
  const res = await axiosInstance.post(`/admin/pedido/${pedidoId}/process`);
  return res.data;
};

export const getOrderByIdAPI = async (pedidoId) => {
  const res = await axiosInstance.get(`/pedido/${pedidoId}`);
  return res.data;
};
