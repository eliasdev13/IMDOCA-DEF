  // src/utils/axiosInstance.js
  import axios from "axios";

  const axiosInstance = axios.create({
    baseURL: "/api",   // 🔥 Mejor: todas las rutas salen como /api/....
    withCredentials: true,
  });

  // -------------------------------------------------------
  // Estado del refresh
  // -------------------------------------------------------
  let isRefreshing = false;
  let failedQueue = [];

  const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
      error ? prom.reject(error) : prom.resolve(token);
    });
    failedQueue = [];
  };

  // -------------------------------------------------------
  // Request: agrega Authorization
  // -------------------------------------------------------
  axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  // -------------------------------------------------------
  // Response: intenta refresh SOLO si corresponde
  // -------------------------------------------------------
  axiosInstance.interceptors.response.use(
    (res) => res,

    async (error) => {
      const original = error.config;

      // ----------------------------------------------------
      // NO intentar refresh si:
      // - es refresh mismo
      // - es un error de roles ("No autorizado")
      // ----------------------------------------------------
      if (original.url === "/refresh") {
        return Promise.reject(error);
      }

      if (error.response?.data === "No autorizado") {
        return Promise.reject(error);
      }

      // ----------------------------------------------------
      // REFRESH TOKEN (solo si status 403 y no reintentado)
      // ----------------------------------------------------
      if (error.response?.status === 403 && !original._retry) {
        original._retry = true;

        if (isRefreshing) {
          return new Promise((resolve, reject) =>
            failedQueue.push({ resolve, reject })
          ).then((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(original);
          });
        }

        isRefreshing = true;

        try {
          // 🔥 usar axiosInstance, NO axios global
          const res = await axiosInstance.post("/refresh");

          const newToken = res.data.accessToken;

          localStorage.setItem("accessToken", newToken);
          axiosInstance.defaults.headers.Authorization = `Bearer ${newToken}`;

          isRefreshing = false;
          processQueue(null, newToken);

          original.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(original);

        } catch (err) {
          isRefreshing = false;
          processQueue(err, null);
          localStorage.removeItem("accessToken");
          window.location.href = "/login";
          return Promise.reject(err);
        }
      }

      return Promise.reject(error);
    }
  );

  export default axiosInstance;
