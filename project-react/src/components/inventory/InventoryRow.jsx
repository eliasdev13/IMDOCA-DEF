import ProductImage from "../product/ProductImage";
import { useProductImage } from "../hooks/useProductImage";

export default function InventoryRow({ item, onAdd, onRemove }) {

  // Obtener imagen REAL del producto
  const imagen = useProductImage(item.producto_id);

  return (
    <tr className="border-b hover:bg-gray-50">

      {/* Imagen */}
      <td className="p-3">
        <ProductImage
          imagen_url={imagen}
          size="mini"
          nombre={item.producto_base}
        />
      </td>

      {/* Datos del producto */}
      <td className="p-3">
        <div className="font-semibold">{item.producto_base}</div>
        <div className="text-gray-500 text-sm">{item.variante}</div>
      </td>

      {/* Lote */}
      <td className="p-3">
        <div className="font-mono text-sm">{item.codigo_lote}</div>
        <div className="text-gray-500 text-xs">
          Vence: {item.fecha_vencimiento?.split("T")[0]}
        </div>
      </td>

      {/* EAN */}
      <td className="p-3 font-mono">{item.ean14}</td>

      {/* Stock */}
      <td className="p-3 font-semibold">{item.stock_cajas}</td>

      {/* Acciones */}
      <td className="p-3 flex gap-2">
        <button 
          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
          onClick={() => onAdd(item.batch_id)}
        >
          +1
        </button>

        <button 
          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
          onClick={() => onRemove(item.batch_id)}
        >
          -1
        </button>
      </td>

    </tr>
  );
}
