import { useEffect, useState } from "react";
import {
  getInventoryAPI,
  addStockAPI,
  removeStockAPI,
} from "../../api/inventory";

import {
  PlusCircleIcon,
  MinusCircleIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";

import IngresarMercaderia from "./IngresarMercarderia";  // ⬅ NUEVO IMPORT

export default function Inventory() {
  const [rows, setRows] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [qty, setQty] = useState("");

  // TAB
  const [activeTab, setActiveTab] = useState("inventory"); 
  // valores: "inventory" | "entry"

  const load = async () => {
    try {
      const data = await getInventoryAPI();
      setRows(data);
    } catch (err) {
      console.error("Error cargando inventario:", err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openModal = (batch, type) => {
    setSelectedBatch(batch);
    setModalType(type);
    setQty("");
  };

  const closeModal = () => {
    setSelectedBatch(null);
    setModalType(null);
    setQty("");
  };

  const submitStock = async () => {
    const cantidad = parseInt(qty, 10);
    if (!cantidad || cantidad <= 0) return alert("Cantidad inválida");

    try {
      if (modalType === "add") await addStockAPI(selectedBatch, cantidad);
      if (modalType === "remove") await removeStockAPI(selectedBatch, cantidad);

      closeModal();
      load();
    } catch (err) {
      alert("Error en la operación");
    }
  };

  return (
    <div
      className="
      max-w-7xl mx-auto p-8 mt-10
      bg-white dark:bg-gray-900 
      shadow-xl rounded-xl 
      border border-gray-200 dark:border-gray-700
      text-gray-900 dark:text-gray-100
      animate-fade-in
      "
    >
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <CubeIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        Gestión de Inventario
      </h1>

      {/* ------------------------- TABS ------------------------- */}
      <div className="flex gap-4 mb-6 border-b dark:border-gray-700 pb-3">

        <button
          onClick={() => setActiveTab("inventory")}
          className={`
            px-4 py-2 rounded-t-lg font-semibold 
            ${activeTab === "inventory"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 dark:bg-gray-700"}
          `}
        >
          Inventario General
        </button>

        <button
          onClick={() => setActiveTab("entry")}
          className={`
            px-4 py-2 rounded-t-lg font-semibold 
            ${activeTab === "entry"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 dark:bg-gray-700"}
          `}
        >
          Ingresar Mercadería
        </button>

      </div>

      {/* ---------------------- CONTENIDO TAB INVENTARIO ---------------------- */}
      {activeTab === "inventory" && (
        <>
          {!rows.length ? (
            <p className="mt-10 text-center text-gray-600 dark:text-gray-300">
              Inventario vacío
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700">
                    <th className="p-3 text-left">Producto</th>
                    <th className="p-3 text-left">Variante</th>
                    <th className="p-3 text-left">Presentación</th>
                    <th className="p-3 text-left">Lote</th>
                    <th className="p-3 text-center">Stock</th>
                    <th className="p-3 text-center w-40">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((i) => (
                    <tr
                      key={i.inventario_id}
                      className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition"
                    >
                      <td className="p-3">{i.producto_base}</td>
                      <td className="p-3">{i.variante}</td>
                      <td className="p-3">{i.presentacion}</td>
                      <td className="p-3">{i.codigo_lote}</td>

                      <td className="p-3 text-center font-bold text-blue-700 dark:text-blue-300">
                        {i.stock_cajas}
                      </td>

                      <td className="p-3 text-center flex justify-center gap-3">
                        <button
                          onClick={() => openModal(i.batch_id, "add")}
                          className="
                            flex items-center gap-1 px-3 py-1
                            bg-green-600 hover:bg-green-700 text-white 
                            rounded-lg shadow transition
                          "
                        >
                          <PlusCircleIcon className="w-5 h-5" /> Agregar
                        </button>

                        <button
                          onClick={() => openModal(i.batch_id, "remove")}
                          className="
                            flex items-center gap-1 px-3 py-1
                            bg-red-600 hover:bg-red-700 text-white 
                            rounded-lg shadow transition
                          "
                        >
                          <MinusCircleIcon className="w-5 h-5" /> Restar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ------------------ MODAL ADD/REMOVE STOCK ------------------ */}
          {modalType && (
            <div className="
                fixed inset-0 bg-black/50 backdrop-blur-sm 
                flex items-center justify-center z-50 animate-fade-in
            ">
              <div className="bg-white dark:bg-gray-900 w-96 p-6 rounded-xl shadow-xl border border-gray-300 dark:border-gray-700">

                <h2 className="text-xl font-bold mb-4">
                  {modalType === "add" ? "Agregar Stock" : "Restar Stock"}
                </h2>

                <input
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  className="
                    w-full px-4 py-2 rounded-md border 
                    bg-gray-100 dark:bg-gray-800 
                    border-gray-300 dark:border-gray-700 
                    focus:ring-2 focus:ring-blue-500 outline-none 
                    text-gray-900 dark:text-gray-100
                  "
                  placeholder="Cantidad"
                />

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600"
                  >
                    Cancelar
                  </button>

                  <button
                    onClick={submitStock}
                    className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Confirmar
                  </button>
                </div>

              </div>
            </div>
          )}
        </>
      )}

      {/* -------------------- CONTENIDO TAB INGRESAR MERCADERÍA -------------------- */}
      {activeTab === "entry" && (
        <IngresarMercaderia onSuccess={load} />
      )}
    </div>
  );
}
