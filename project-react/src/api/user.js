import axiosInstance from "../utils/axiosInstance"; // tu instancia de axios configurada

// Crear usuario normal (admin o vendedor)
export const createUserAPI = async (userData, token) => {
  try {
    const res = await axiosInstance.post("/createUser", userData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("Error creando usuario:", err);
    throw err.response?.data || err;
  }
};

// Crear cliente
export const createClientAPI = async (clientData, token) => {
  try {
    const res = await axiosInstance.post("/createClient", clientData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("Error creando cliente:", err);
    throw err.response?.data || err;
  }
};


// Trae el perfil del usuario logeado
export const getProfileAPI = async (token) => {
  const res = await axiosInstance.get("/user/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
