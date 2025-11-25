export default function Toast({ message, type = "error", open, onClose }) {
  if (!open) return null;

  const colors = { error: "bg-red-500", success: "bg-green-500", warning: "bg-yellow-500" };

  return (
    <div className={`fixed top-4 right-4 max-w-xs w-full ${colors[type]} text-white px-4 py-3 rounded shadow-lg flex items-center space-x-2 animate-slide-in`}>
      <span className="flex-1">{message}</span>
      <button className="ml-2 text-white hover:opacity-80" onClick={onClose}>×</button>
    </div>
  );
}
