// src/pages/users/Users.jsx
import { useEffect, useState } from "react";
import { getAllUsersAPI } from "../../api/user";
import { useNavigate } from "react-router-dom";

export default function Users() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  const getRoleName = (id) => {
    switch (id) {
      case 1: return "Administrador";
      case 2: return "Vendedor";
      case 3: return "Cliente";
      default: return "Desconocido";
    }
  };

  useEffect(() => {
    getAllUsersAPI().then(res => setUsers(res.users));
  }, []);

  return (
    <div className="p-6">

      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Usuarios</h1>

        <button
          onClick={() => navigate("/users/create")}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          + Crear Usuario
        </button>
      </div>

      <table className="w-full bg-white dark:bg-gray-800 rounded-lg shadow">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700 text-left">
            <th className="p-3">ID</th>
            <th className="p-3">Nombre</th>
            <th className="p-3">Email</th>
            <th className="p-3">Rol</th>
            <th className="p-3">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {users.map(u => (
            <tr key={u.user_id} className="border-t">
              <td className="p-3">{u.user_id}</td>
              <td className="p-3">{u.name}</td>
              <td className="p-3">{u.email}</td>
              <td className="p-3">{getRoleName(u.rol_id)}</td>
              <td className="p-3">
                <button
                  onClick={() => navigate(`/users/${u.user_id}`)}
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
