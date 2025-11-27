export default function ProductImage({ imagen_url, nombre, size = "card" }) {
  const fallback = "/uploads/default.jpg";

  const classBySize = {
    mini: "w-14 h-14 object-cover rounded-md shadow",
    detail:
      "w-full max-w-lg h-96 md:h-[450px] rounded-xl shadow object-cover mx-auto",
    card: "w-40 h-40 md:w-48 md:h-48 rounded-lg shadow object-cover",
  };

  const className = classBySize[size] || classBySize.card;

  // Si no hay imagen → fallback inmediato
  if (!imagen_url) {
    return (
      <img
        src={fallback}
        alt={nombre}
        loading="lazy"
        className={`${className} animate-fade-in`}
      />
    );
  }

  // Tomar solo la primera
  const img = imagen_url.split(",")[0].trim();

  return (
    <img
      src={`http://localhost:3000/uploads/${img}`}
      alt={nombre}
      loading="lazy"
      className={`${className} animate-fade-in`}
      onError={(e) => (e.target.src = fallback)}
    />
  );
}
