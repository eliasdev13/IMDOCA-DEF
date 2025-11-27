// src/api/inventory.js
import axiosInstance from "../utils/axiosInstance";

export const getInventoryAPI = async () => {
  const res = await axiosInstance.get("/inventario/all");
  return res.data;
};

export const addStockAPI = async (batch_id, cantidad) => {
  const res = await axiosInstance.post("/inventario/addStock", {
    batch_id,
    cantidad,              // el backend ahora acepta "cantidad" o "cantidad_cajas"
  });
  return res.data;
};

export const removeStockAPI = async (batch_id, cantidad) => {
  const res = await axiosInstance.post("/inventario/removeStock", {
    batch_id,
    cantidad,
  });
  return res.data;
};

export const ingresarMercaderiaAPI = async (payload) => {
  const res = await axiosInstance.post("/inventario/ingresar", payload);
  return res.data;
};
