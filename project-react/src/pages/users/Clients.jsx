// src/pages/users/Clients.jsx
import { useEffect, useState } from "react";
import { getAllClientsAPI } from "../../api/user";
import { useNavigate } from "react-router-dom";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getAllClientsAPI().then(res => setClients(res.clients));
  }, []);

  return (
    <div className="p-6">

      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Clientes</h1>

        <button
          onClick={() => navigate("/clients/create")}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          + Crear Cliente
        </button>
      </div>

      <table className="w-full bg-white dark:bg-gray-800 rounded-lg shadow">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700 text-left">
            <th className="p-3">ID</th>
            <th className="p-3">Nombre</th>
            <th className="p-3">Email</th>
            <th className="p-3">Teléfono</th>
            <th className="p-3">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {clients.map(c => (
            <tr key={c.cliente_id} className="border-t">
              <td className="p-3">{c.cliente_id}</td>
              <td className="p-3">{c.name}</td>
              <td className="p-3">{c.email}</td>
              <td className="p-3">{c.telefono}</td>
              <td className="p-3">
                <button
                  onClick={() => navigate(`/clients/${c.cliente_id}`)}
                  className="px-3 py-1 bg-blue-600 text-white rounded"
                >
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}
