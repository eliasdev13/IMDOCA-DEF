// src/api/productsAPI.js
import axiosInstance from "../utils/axiosInstance";


export const getAllProductsAPI = async () => {
  const res = await axiosInstance.get("/api/products");
  return res.data; // Devuelve el array de productos con EAN14
};

export const getProductByIdAPI = async (id) => {
  const res = await axiosInstance.get(`/api/product/${id}`);
  return res.data; // Devuelve un producto
};

// Crear producto
export const createProductAPI = async (data) => {
  const res = await axiosInstance.post("/api/product", data);
  return res.data;
};
