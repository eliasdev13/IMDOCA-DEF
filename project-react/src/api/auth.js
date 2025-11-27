import axios from "axios";
import axiosInstance from "../utils/axiosInstance";

// LOGIN
export const loginAPI = async (email, password) => {
  const res = await axios.post("/api/login", { email, password }, { withCredentials: true });
  // res.data => { user, accessToken, message }
  return res.data;
};

// REFRESH TOKEN
export const refreshAPI = async () => {
  const res = await axios.post("/api/refresh", {}, { withCredentials: true });
  // res.data => { accessToken }
  return res.data;
};


// LOGOUT
export const logoutAPI = async () => {
  const res = await axiosInstance.post("/logout", {}, { withCredentials: true });
  localStorage.removeItem("accessToken"); // asegurarse de limpiar token
  return res.data;
};


