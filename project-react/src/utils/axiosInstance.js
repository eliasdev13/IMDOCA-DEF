// src/utils/axiosInstance.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/", // proxy al backend
  withCredentials: true, // envía cookies HttpOnly
});

let isRefreshing = false;
let failedQueue = [];

// Procesa requests en cola después del refresh
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// Interceptor de requests: agrega Authorization
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers["Authorization"] = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de responses: maneja 403 y refresh token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Solo aplicamos refresh si es un 403 y no se ha reintentado
    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Si ya hay refresh en curso, ponemos la request en cola
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers["Authorization"] = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        });
      }

      isRefreshing = true;

      return new Promise(async (resolve, reject) => {
        try {
          // Llamada a refresh
          const res = await axios.post("/api/refresh", {}, { withCredentials: true });
          const newToken = res.data.accessToken;

          if (!newToken) throw new Error("No se recibió nuevo token");

          // Guardamos token nuevo
          localStorage.setItem("accessToken", newToken);
          axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

          isRefreshing = false;
          processQueue(null, newToken);

          // Reintentamos la request original
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
          resolve(axiosInstance(originalRequest));
        } catch (err) {
          isRefreshing = false;
          processQueue(err, null);
          localStorage.removeItem("accessToken");
          window.location.href = "/login"; // fuerza logout
          reject(err);
        }
      });
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
