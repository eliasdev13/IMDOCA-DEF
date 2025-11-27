// src/components/auth/LoginForm.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Toast from "../ui/Toast";

export default function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Error del servidor");
    }
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">

      {error && (
        <Toast
          message={error}
          type="error"
          open={!!error}
          onClose={() => setError("")}
        />
      )}

      <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-6">
        Iniciar Sesión
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        <div className="flex flex-col">
          <label className="text-gray-700 dark:text-gray-300 text-sm mb-1">
            Email
          </label>
          <input
            type="email"
            className="border rounded-lg px-4 py-3 
            bg-gray-50 dark:bg-gray-700 
            text-gray-800 dark:text-white 
            placeholder-gray-400 dark:placeholder-gray-300
            focus:ring-2 focus:ring-blue-600 focus:outline-none"
            placeholder="tucorreo@empresa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-gray-700 dark:text-gray-300 text-sm mb-1">
            Contraseña
          </label>
          <input
            type="password"
            className="border rounded-lg px-4 py-3 
            bg-gray-50 dark:bg-gray-700 
            text-gray-800 dark:text-white 
            placeholder-gray-400 dark:placeholder-gray-300
            focus:ring-2 focus:ring-blue-600 focus:outline-none"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-blue-600 text-white font-semibold 
          rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300"
        >
          Entrar
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
        © {new Date().getFullYear()} Importadora IMODCA
        <br />
        Todos los derechos reservados.
      </p>
    </div>
  );
}
