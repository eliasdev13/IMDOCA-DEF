// src/routes/AppRoutes.jsx
import { Routes, Route } from "react-router-dom";

// PUBLIC
import Login from "../pages/public/Login";
import NotFound from "../pages/public/NotFound";

// PRIVATE (ALL ROLES)
import Home from "../pages/public/Home";
import Profile from "../pages/users/Profile";

// ADMIN PANEL COMBINED
import AdminManage from "../pages/users/AdminManage";

// USERS
import CreateUser from "../pages/users/CreateUser";
import EditUser from "../pages/users/EditUser";

// CLIENTS
import CreateClient from "../pages/users/CreateClient";
import EditClient from "../pages/users/EditClient";

// INVENTORY / PRODUCTS
import Inventory from "../pages/users/Inventory";
import CreateProduct from "../pages/users/CreateProduct";
import IngresarMercaderia from "../pages/users/IngresarMercarderia"; // ⬅ NUEVO

// CLIENT SIDE
import Products from "../pages/client/Products";
import ProductDetail from "../pages/client/ProductDetail";
import Cart from "../pages/client/Cart";
import MyOrders from "../pages/client/MyOrders";
import OrderDetailClient from "../pages/client/OrderDetail";

// ADMIN ORDERS
import OrdersAdmin from "../pages/users/OrdersAdmin";
import OrderDetailAdmin from "../pages/users/OrderDetailAdmin";

// AUTH
import ProtectedRoute from "../components/layout/ProtectedRoute";
import PublicRoute from "../components/layout/PublicRoute";

export default function AppRoutes() {
  return (
    <Routes>

      {/* PUBLIC */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* PRIVATE - ANY ROLE */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />

        {/* CLIENTE */}
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/my-orders/:id" element={<OrderDetailClient />} />
      </Route>

      {/* ADMIN ONLY */}
      <Route element={<ProtectedRoute role={1} />}>

        <Route path="/admin/manage" element={<AdminManage />} />

        {/* USERS */}
        <Route path="/users/create" element={<CreateUser />} />
        <Route path="/users/:id" element={<EditUser />} />

        {/* CLIENTS */}
        <Route path="/clients/create" element={<CreateClient />} />
        <Route path="/clients/:id" element={<EditClient />} />

        {/* INVENTARIO */}
        <Route path="/inventory" element={<Inventory />} />

        {/* PANTALLA DE INGRESO */}
        <Route path="/inventario/ingresar" element={<IngresarMercaderia />} />

        {/* PRODUCTOS */}
        <Route path="/createProduct" element={<CreateProduct />} />

        {/* ADMIN ORDERS */}
        <Route path="/admin/orders" element={<OrdersAdmin />} />
        <Route path="/admin/orders/:id" element={<OrderDetailAdmin />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />

    </Routes>
  );
}
