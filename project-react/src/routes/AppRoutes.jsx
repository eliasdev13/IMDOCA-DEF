import { Routes, Route } from "react-router-dom";
import Home from "../pages/public/Home";
import Login from "../pages/public/Login";
import Profile from "../pages/users/Profile";
import CreateClient from "../pages/users/CreateClient";
import CreateUser from "../pages/users/CreateUser";

// Client


import Cart from "../pages/client/Cart";
//import Checkout from "../pages/client/Checkout";

// Admin
/*
import AdminDashboard from "../pages/admin/Dashboard";
import ManageProducts from "../pages/admin/ManageProducts";
import ManageOrders from "../pages/admin/ManageOrders";
import ManageUsers from "../pages/admin/ManageUsers";
*/
import CrearProduct from "../pages/users/CreateProduct";
import Products from "../pages/client/Products";
import ProductDetail from "../pages/client/ProductDetail";
/*

// Seller
import SellerDashboard from "../pages/seller/SellerDashboard";
import SellerInventory from "../pages/seller/SellerInventory";
import SellerOrders from "../pages/seller/SellerOrders";
*/

import ProtectedRoute from "../components/layout/ProtectedRoute";
import PublicRoute from "../components/layout/PublicRoute";
import Inventory from "../pages/users/Inventory";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Profile route: cualquier usuario logueado */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      {/* Client routes (roleId 3) */}
      <Route element={<ProtectedRoute role={2} />}>
        {/* Las demás rutas de cliente aún no existen */}
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/inventory" element={<Inventory />} />
        {/* <Route path="/checkout" element={<Checkout />} /> */}
      </Route>

      {/* Seller routes (roleId 2) */}
      <Route element={<ProtectedRoute role={2} />}>
        {/* Aún no existen */}
        {/* <Route path="/seller" element={<SellerDashboard />} /> */}
        {/* <Route path="/seller/inventory" element={<SellerInventory />} /> */}
        {/* <Route path="/seller/orders" element={<SellerOrders />} /> */}
      </Route>

      {/* Admin routes (roleId 1) */}
      <Route element={<ProtectedRoute role={1} />}>
        {/* Solo lo que ya existe */}
        <Route path="/createUser" element={<CreateUser />} />
        <Route path="/createClient" element={<CreateClient />} />
        <Route path="/createProduct" element={<CrearProduct />} />
        {/* <Route path="/admin" element={<AdminDashboard />} /> */}
        {/* <Route path="/admin/products" element={<ManageProducts />} /> */}
        {/* <Route path="/admin/orders" element={<ManageOrders />} /> */}
        {/* <Route path="/admin/users" element={<ManageUsers />} /> */}
      </Route>
    </Routes>
  );
}
