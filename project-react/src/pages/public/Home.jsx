import { useState, useEffect } from "react";

export default function Home() {
  const [open, setOpen] = useState(false);

  // Si quieres que desaparezca automáticamente después de 1 segundo
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => setOpen(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Home</h1>

      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Open
      </button>

      {/* Snackbar / Toast */}
      {open && (
        <div
          className="fixed top-4 right-4 max-w-xs w-full
                     bg-yellow-500 text-white px-4 py-3 rounded shadow-lg
                     flex items-center space-x-2 animate-slide-in"
        >
          {/* Icono de advertencia, puedes cambiarlo por uno SVG */}
          <svg
            className="h-6 w-6 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01M10 12a2 2 0 104 0 2 2 0 00-4 0z"
            />
          </svg>
          <span className="flex-1">This is a warning alert — check it out!</span>
          <button
            className="ml-2 text-white hover:opacity-80"
            onClick={() => setOpen(false)}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
