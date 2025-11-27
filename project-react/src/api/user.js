import axiosInstance from "../utils/axiosInstance";

/* =====================================================================================
   USUARIOS
===================================================================================== */

export const getAllUsersAPI = async () =>
  (await axiosInstance.get("/users")).data;

export const getUserAPI = async (id) =>
  (await axiosInstance.get(`/user/${id}`)).data;

export const createUserAPI = async (data) =>
  (await axiosInstance.post("/createUser", data)).data;

export const updateUserAPI = async (id, data) =>
  (await axiosInstance.put(`/user/${id}`, data)).data;

export const deleteUserAPI = async (id) =>
  (await axiosInstance.delete(`/user/${id}`)).data;

/* =====================================================================================
   CLIENTES
===================================================================================== */

export const getAllClientsAPI = async () =>
  (await axiosInstance.get("/clients")).data;

export const getClientAPI = async (id) =>
  (await axiosInstance.get(`/client/${id}`)).data;

export const createClientAPI = async (data) =>
  (await axiosInstance.post("/createClient", data)).data;

export const updateClientAPI = async (id, data) =>
  (await axiosInstance.put(`/client/${id}`, data)).data;

export const deleteClientAPI = async (id) =>
  (await axiosInstance.delete(`/client/${id}`)).data;

/* =====================================================================================
   PERFIL
===================================================================================== */

export const getProfileAPI = async () =>
  (await axiosInstance.get("/user/profile")).data;
