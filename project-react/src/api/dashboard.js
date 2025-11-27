import axiosInstance from "../utils/axiosInstance";

// Total pedidos hoy
export const getPedidosHoyAPI = async () => {
  const res = await axiosInstance.get("/pedidos-hoy");
  return res.data;
};

// Clientes activos
export const getClientesActivosAPI = async () => {
  const res = await axiosInstance.get("/clientes-activos");
  return res.data;
};

// Total productos
export const getProductosAPI = async () => {
  const res = await axiosInstance.get("/productos-total");
  return res.data;
};

// Últimos pedidos (5)
export const getUltimosPedidosAPI = async () => {
  const res = await axiosInstance.get("/ultimos-pedidos");
  return res.data;
};

// Stock bajo
export const getStockBajoAPI = async () => {
  const res = await axiosInstance.get("/stock-bajo");
  return res.data;
};
