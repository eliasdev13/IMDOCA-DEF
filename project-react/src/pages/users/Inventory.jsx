import { useEffect, useState } from "react";
import { getInventoryAPI, addStockAPI, removeStockAPI } from "../../api/inventory";
import InventoryRow from "../../components/inventory/InventoryRow";

export default function Inventory() {
  const [inventario, setInventario] = useState([]);
  const [filtro, setFiltro] = useState("");

  const cargarInventario = () => {
    getInventoryAPI()
      .then(setInventario)
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    cargarInventario();
  }, []);

  const addStock = async (batch_id) => {
    await addStockAPI(batch_id, 1);
    cargarInventario();
  };

  const removeStock = async (batch_id) => {
    await removeStockAPI(batch_id, 1);
    cargarInventario();
  };

  const filtrados = inventario.filter((i) =>
    (i.producto_base + i.variante + i.codigo_lote + i.ean14)
      .toLowerCase()
      .includes(filtro.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Inventario</h1>

      {/* Buscador */}
      <input
        type="text"
        placeholder="Buscar por producto, lote o EAN..."
        className="w-full p-3 border rounded mb-4"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
      />

      {/* Tabla */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="w-full">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Imagen</th>
              <th className="p-3">Producto</th>
              <th className="p-3">Lote</th>
              <th className="p-3">EAN14</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {filtrados.map((item) => (
              <InventoryRow
                key={item.batch_id}
                item={item}
                onAdd={addStock}
                onRemove={removeStock}
              />
            ))}
          </tbody>
        </table>
      </div>

      {filtrados.length === 0 && (
        <p className="text-center text-gray-600 mt-4">No se encontraron resultados.</p>
      )}
    </div>
  );
}
