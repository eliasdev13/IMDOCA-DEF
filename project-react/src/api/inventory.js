import axiosInstance from "../utils/axiosInstance";

export const getInventoryAPI = () =>
  axiosInstance.get("/api/inventario/all").then(res => res.data);

export const addStockAPI = (batch_id, cantidad) =>
  axiosInstance.post("/api/inventario/addStock", { batch_id, cantidad });

export const removeStockAPI = (batch_id, cantidad) =>
  axiosInstance.post("/api/inventario/removeStock", { batch_id, cantidad });
