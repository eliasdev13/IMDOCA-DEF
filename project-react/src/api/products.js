import axiosInstance from "../utils/axiosInstance";

//
// PRODUCTOS
//

export const getAllProductsAPI = async () => {
  const res = await axiosInstance.get("/products");
  return res.data;
};

export const getProductByIdAPI = async (id) => {
  const res = await axiosInstance.get(`/product/${id}`);
  return res.data;
};

export const createProductAPI = async (formData, token) => {
  const res = await axiosInstance.post("/product", formData, {
    headers: { 
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data"
    },
  });
  return res.data;
};

//
// DATA PARA SELECTORES
//
export const getTiposAPI = () => axiosInstance.get("/data/tipos").then(r => r.data);
export const getCategoriasAPI = () => axiosInstance.get("/data/categorias").then(r => r.data);
export const getProductoBaseAPI = () => axiosInstance.get("/data/producto-base").then(r => r.data);
export const getVariantesAPI = (categoria_id) =>
  axiosInstance.get(`/data/variantes/${categoria_id}`).then(r => r.data);
export const getPresentacionesAPI = () =>
  axiosInstance.get("/data/presentaciones").then(r => r.data);

// CREAR NUEVOS
export const addTipoAPI = (nombre) =>
  axiosInstance.post("/data/tipos", { nombre }).then(r => r.data);

export const addCategoriaAPI = (nombre) =>
  axiosInstance.post("/data/categorias", { nombre }).then(r => r.data);

export const addProductoBaseAPI = (tipo_id, nombre) =>
  axiosInstance.post("/data/producto-base", { tipo_id, nombre }).then(r => r.data);

export const addVarianteAPI = (categoria_id, nombre) =>
  axiosInstance.post("/data/variantes", { categoria_id, nombre }).then(r => r.data);

export const addPresentacionAPI = (nombre) =>
  axiosInstance.post("/data/presentaciones", { nombre }).then(r => r.data);