import axiosInstance from "../utils/axiosInstance";

export const getCartAPI = async () => {
  const res = await axiosInstance.get("/cart");
  return res.data;
};

export const addToCartAPI = async (batch_id, cantidad) => {
  return axiosInstance.post("/cart/add", {
    batch_id,
    cantidad_cajas: Number(cantidad),   // ✔ nombre correcto
  });
};
 
export const clearCartAPI = async () => {
  const res = await axiosInstance.delete("/cart/clear");
  return res.data;
};

export const removeItemFromCartAPI = async (itemId) => {
  const res = await axiosInstance.delete(`/cart/item/${itemId}`);
  return res.data;
};

export const confirmCartAPI = async () => {
  const res = await axiosInstance.post("/cart/confirm");
  return res.data;
};
