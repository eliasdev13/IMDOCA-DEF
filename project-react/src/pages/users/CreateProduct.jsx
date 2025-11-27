import { useEffect, useState } from "react";
import {
  getTiposAPI,
  getCategoriasAPI,
  getProductoBaseAPI,
  getVariantesAPI,
  getPresentacionesAPI,
  addTipoAPI,
  addCategoriaAPI,
  addProductoBaseAPI,
  addVarianteAPI,
  addPresentacionAPI,
  createProductAPI
} from "../../api/products";

import { useAuth } from "../../context/AuthContext";
import Modal from "../../components/ui/Modal";

export default function CreateProduct() {
  const { user } = useAuth();
  const token = user.accessToken;

  const [tipos, setTipos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [productoBase, setProductoBase] = useState([]);
  const [variantes, setVariantes] = useState([]);
  const [presentaciones, setPresentaciones] = useState([]);

  const [modal, setModal] = useState(null);

  const [imagen, setImagen] = useState(null);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    tipo: "",
    categoria: "",
    producto_base_id: "",
    variante_id: "",
    presentacion_id: "",
  });

  useEffect(() => {
    getTiposAPI().then(setTipos);
    getCategoriasAPI().then(setCategorias);
    getPresentacionesAPI().then(setPresentaciones);
  }, []);

  useEffect(() => {
    if (form.tipo) getProductoBaseAPI().then(setProductoBase);
  }, [form.tipo]);

  useEffect(() => {
    if (form.categoria) getVariantesAPI(form.categoria).then(setVariantes);
  }, [form.categoria]);

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    if (imagen) data.append("imagen", imagen);

    try {
      await createProductAPI(data, token);
      setMsg("Producto creado correctamente ✔");
    } catch {
      setMsg("Error creando producto");
    }
  };

  const crearNuevo = async (type, nombre) => {
    if (type === "tipo") {
      const r = await addTipoAPI(nombre);
      setTipos([...tipos, r]);
    }
    if (type === "categoria") {
      const r = await addCategoriaAPI(nombre);
      setCategorias([...categorias, r]);
    }
    if (type === "producto_base") {
      const r = await addProductoBaseAPI(form.tipo, nombre);
      setProductoBase([...productoBase, r]);
    }
    if (type === "variante") {
      const r = await addVarianteAPI(form.categoria, nombre);
      setVariantes([...variantes, r]);
    }
    if (type === "presentacion") {
      const r = await addPresentacionAPI(nombre);
      setPresentaciones([...presentaciones, r]);
    }

    setModal(null);
  };

  return (
    <>
      <div className="max-w-3xl mx-auto mt-10 bg-white dark:bg-gray-900 shadow-lg rounded-xl p-8">
        <h2 className="text-3xl font-bold mb-6">Crear Producto</h2>

        <form onSubmit={submit} className="space-y-6">

          <Selector
            label="Tipo"
            name="tipo"
            value={form.tipo}
            onChange={handleChange}
            items={tipos}
            itemKey="tipo_id"
            itemLabel="nombre"
            sendId
            onAdd={() => setModal("tipo")}
          />

          <Selector
            label="Categoría"
            name="categoria"
            value={form.categoria}
            onChange={handleChange}
            items={categorias}
            itemKey="categoria_id"
            itemLabel="nombre"
            sendId
            onAdd={() => setModal("categoria")}
          />

          <Selector
            label="Producto base"
            name="producto_base_id"
            value={form.producto_base_id}
            onChange={handleChange}
            items={productoBase}
            itemKey="producto_base_id"
            itemLabel="nombre"
            sendId
            onAdd={() => setModal("producto_base")}
          />

          <Selector
            label="Variante"
            name="variante_id"
            value={form.variante_id}
            onChange={handleChange}
            items={variantes}
            itemKey="variante_id"
            itemLabel="nombre"
            sendId
            onAdd={() => setModal("variante")}
          />

          <Selector
            label="Presentación (CAJA)"
            name="presentacion_id"
            value={form.presentacion_id}
            onChange={handleChange}
            items={presentaciones}
            itemKey="presentacion_id"
            itemLabel="nombre"
            sendId
            onAdd={() => setModal("presentacion")}
          />

          <div>
            <label className="block font-medium mb-1">Imagen</label>
            <input
              type="file"
              onChange={e => setImagen(e.target.files[0])}
              className="w-full border rounded-lg p-2"
            />
          </div>

          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-lg shadow">
            Crear Producto
          </button>

          {msg && <p className="text-center mt-3 text-green-600">{msg}</p>}
        </form>
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={`Crear ${modal}`}>
        <CrearItemModal type={modal} onCreate={crearNuevo} />
      </Modal>
    </>
  );
}


function Selector({ label, name, value, onChange, items, itemKey, itemLabel, sendId, onAdd }) {
  return (
    <div>
      <label className="block font-medium mb-1">{label}</label>
      <div className="flex gap-2">
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="flex-1 border rounded-lg p-3"
          required
        >
          <option value="">Seleccionar...</option>
          {items.map((i) => (
            <option key={i[itemKey]} value={sendId ? i[itemKey] : i[itemLabel]}>
              {i[itemLabel]}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={onAdd}
          className="px-3 py-2 bg-green-600 text-white rounded-lg shadow"
        >
          +
        </button>
      </div>
    </div>
  );
}

function CrearItemModal({ type, onCreate }) {
  const [nombre, setNombre] = useState("");

  return (
    <div className="space-y-4">
      <input
        placeholder={`Nombre de ${type}`}
        value={nombre}
        onChange={e => setNombre(e.target.value)}
        className="w-full border rounded-lg p-3"
      />

      <button
        className="w-full bg-blue-600 text-white py-2 rounded-lg"
        onClick={() => onCreate(type, nombre)}
      >
        Guardar
      </button>
    </div>
  );
}
