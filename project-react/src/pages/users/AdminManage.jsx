import { useState } from "react";
import Users from "./Users";
import Clients from "./Clients";

export default function AdminManage() {
  const [tab, setTab] = useState("users");

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Administración</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded 
          ${tab === "users" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          onClick={() => setTab("users")}
        >
          Usuarios
        </button>

        <button
          className={`px-4 py-2 rounded 
          ${tab === "clients" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          onClick={() => setTab("clients")}
        >
          Clientes
        </button>
      </div>

      {/* Contenido */}
      {tab === "users" && <Users />}
      {tab === "clients" && <Clients />}
    </div>
  );
}
