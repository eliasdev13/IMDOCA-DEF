export default function ProductImage({ imagen_url, nombre, size = "card" }) {
  let className = "";
  const fallback = "http://localhost:3000/uploads/default.jpg";

  switch (size) {
    case "mini":
      className = "w-14 h-14 object-cover rounded-md shadow";
      break;

    case "detail":
      className = "w-full max-w-lg h-96 md:h-[450px] object-cover rounded-xl shadow mx-auto";
      break;

    case "card":
    default:
      className = "w-40 h-40 md:w-48 md:h-48 object-cover rounded-lg shadow";
      break;
  }

  if (!imagen_url) {
    return <img src={fallback} alt={nombre} className={className} />;
  }

  const img = imagen_url.split(",")[0].trim();

  return (
    <img
      src={`http://localhost:3000/uploads/${img}`}
      alt={nombre}
      className={className}
      onError={(e) => (e.target.src = fallback)}
    />
  );
}
