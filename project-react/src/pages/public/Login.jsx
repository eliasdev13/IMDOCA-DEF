import LoginForm from "../../components/auth/LoginFrom";
import logo from "../../assets/Imagen1.jpg";

export default function Login() {
  return (
    <div
      className="
        min-h-screen flex 
        bg-gray-100 
        dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-black
        text-gray-900 dark:text-white
        overflow-hidden
      "
    >

      {/* BRANDING – SOLO DESKTOP */}
      <div className="hidden xl:flex w-1/2 relative items-center justify-center">

        {/* EFECTO DE LUCES */}
        <div className="absolute inset-0 opacity-50">
          <div className="absolute w-96 h-96 bg-blue-500/30 blur-3xl top-20 left-10"></div>
          <div className="absolute w-96 h-96 bg-purple-600/30 blur-3xl bottom-20 right-10"></div>
        </div>

        {/* CONTENIDO */}
        <div className="relative z-10 text-center px-10 animate-fade-in">
          <img src={logo} className="w-40 mx-auto mb-6 drop-shadow-2xl" />

          <h2 className="text-4xl font-bold mb-4">
            IMPORTADORA IMODCA
          </h2>

          <p className="text-gray-300 text-lg">
            Sistema de pedidos, inventario y clientes. <br />
            Acceso exclusivo para usuarios autorizados.
          </p>
        </div>
      </div>

      {/* FORMULARIO */}
      <div className="flex w-full xl:w-1/2 items-center justify-center px-6">
        <div className="w-full max-w-md animate-fade-in-up">

          {/* LOGO MOBILE */}
          <div className="xl:hidden flex justify-center mb-8">
            <img src={logo} className="w-28" />
          </div>

          <LoginForm />
        </div>
      </div>

    </div>
  );
}
