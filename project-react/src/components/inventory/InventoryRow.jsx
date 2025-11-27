// src/components/inventory/InventoryRow.jsx
export default function InventoryRow({ item, onAdd, onRemove }) {
  const getVencimientoColor = (fecha) => {
    const hoy = new Date();
    const venc = new Date(fecha);
    const diff = (venc - hoy) / (1000 * 60 * 60 * 24);

    if (diff < 0) return "bg-red-200 text-red-700";
    if (diff <= 30) return "bg-yellow-200 text-yellow-700";
    return "bg-green-200 text-green-700";
  };

  return (
    <tr className="border-t hover:bg-gray-50">
      <td className="p-3">
        {item.producto_base} - {item.variante}
      </td>

      <td className="p-3">{item.presentacion}</td>

      <td className="p-3 font-mono">{item.ean14}</td>

      <td className="p-3 font-mono">{item.codigo_lote}</td>

      <td className="p-3 font-semibold">{item.stock_cajas}</td>

      <td className="p-3">
        <span
          className={`px-2 py-1 rounded ${getVencimientoColor(
            item.fecha_vencimiento
          )}`}
        >
          {new Date(item.fecha_vencimiento).toLocaleDateString()}
        </span>
      </td>

      <td className="p-3 flex gap-2">
        <button
          onClick={() => onAdd(item)}
          className="px-3 py-1 bg-green-600 text-white rounded"
        >
          + Stock
        </button>

        <button
          onClick={() => onRemove(item)}
          className="px-3 py-1 bg-red-600 text-white rounded"
        >
          - Stock
        </button>
      </td>
    </tr>
  );
}
