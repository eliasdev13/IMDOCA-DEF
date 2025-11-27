// server/routes/index.js
const express = require("express");
const router = express.Router();

const upload = require("../middleware/uploadImage");
const { verify } = require("../middleware/verify");
const { checkRole } = require("../middleware/roles");
const validation = require("../middleware/joiValidation");

// JOI SCHEMAS
const { registerUserSchema } = require("../schemas/registeruser");
const { registerClientSchema } = require("../schemas/registerclient");

// CONTROLADORES
const auth = require("../controllers/authController");
const userCtrl = require("../controllers/userController");
const product = require("../controllers/productController");
const inventory = require("../controllers/inventoryController");
const order = require("../controllers/orderController");     // ✔ YA NO ES orderController
const dashboard = require("../controllers/dashboardController");

/* ======================================================
   AUTH
====================================================== */
router.post("/login", auth.login);
router.post("/refresh", auth.refresh);
router.post("/logout", verify, auth.logout);

/* ======================================================
   USERS
====================================================== */
router.get("/user/profile", verify, userCtrl.getProfile);

router.post("/createUser", validation(registerUserSchema), userCtrl.createUser);

router.post(
  "/createClient",
  verify,
  checkRole([1]),
  validation(registerClientSchema),
  userCtrl.createClient
);

router.get("/users", verify, checkRole([1]), userCtrl.getAllUsers);
router.get("/user/:id", verify, checkRole([1]), userCtrl.getUserById);

router.get("/clients", verify, checkRole([1]), userCtrl.getAllClients);
router.get("/client/:id", verify, checkRole([1, 2]), userCtrl.getClient);

router.put("/user/:id", verify, checkRole([1]), userCtrl.updateUser);
router.put("/client/:id", verify, checkRole([1]), userCtrl.updateClient);

router.delete("/user/:id", verify, checkRole([1]), userCtrl.deleteUser);
router.delete("/client/:id", verify, checkRole([1]), userCtrl.deleteClient);

/* ======================================================
   PRODUCTOS
====================================================== */
router.post(
  "/product",
  verify,
  checkRole([1, 2]),
  upload.single("imagen"),
  product.createProduct
);

router.get("/products", verify, product.getAllProducts);
router.get("/product/:id", verify, product.getProductById);

router.post("/product/codes", verify, checkRole([1]), product.createCodes);
router.post("/product/batch", verify, checkRole([1]), product.createBatch);

/* ======================================================
   INVENTARIO
====================================================== */
router.get(
  "/inventario/all",
  verify,
  checkRole([1, 2]),
  inventory.getAllInventory
);

router.post(
  "/inventario/addStock",
  verify,
  checkRole([1, 2]),
  inventory.addStock
);

router.post(
  "/inventario/removeStock",
  verify,
  checkRole([1, 2]),
  inventory.removeStock
);

// Ingreso completo
router.post(
  "/inventario/ingresar",
  verify,
  checkRole([1]),
  inventory.ingresarMercaderia
);

/* ======================================================
   CARRITO (CART)
====================================================== */
router.get("/cart", verify, checkRole([1, 2, 3]), order.getCart);
router.post("/cart/add", verify, checkRole([1, 2, 3]), order.addItemToCart);
router.delete("/cart/item/:id", verify, checkRole([1, 2, 3]), order.removeItemFromCart);
router.delete("/cart/clear", verify, checkRole([1, 2, 3]), order.clearCart);
router.post("/cart/confirm", verify, checkRole([1, 2, 3]), order.createOrderFromCart);

/* ======================================================
   PEDIDOS CLIENTE
====================================================== */
router.get("/pedidos/my-orders", verify, checkRole([1, 2, 3]), order.getOrders);
router.get("/pedidos/:pedidoId/items", verify, checkRole([1, 2, 3]), order.getOrderItems);

/* ======================================================
   ADMIN / SELLER
====================================================== */
router.get("/admin/orders", verify, checkRole([1, 2]), order.getAllOrders);

router.get(
  "/admin/orders/:pedidoId/items",
  verify,
  checkRole([1, 2]),
  order.getOrderItems
);

router.put(
  "/admin/pedido/:pedidoId/status",
  verify,
  checkRole([1, 2]),
  order.updateOrderStatus
);

router.post(
  "/admin/pedido/:pedidoId/process",
  verify,
  checkRole([1, 2]),
  order.processOrder
);

/* ======================================================
   DASHBOARD
====================================================== */
router.get("/pedidos-hoy", dashboard.getPedidosHoy);
router.get("/clientes-activos", dashboard.getClientesActivos);
router.get("/productos-total", dashboard.getProductosTotal);
router.get("/ultimos-pedidos", dashboard.getUltimosPedidos);
router.get("/stock-bajo", dashboard.getStockBajo);

/* ======================================================
   DATA PARA SELECTORES
====================================================== */
router.get("/data/tipos", verify, checkRole([1]), product.getTipos);
router.post("/data/tipos", verify, checkRole([1]), product.addTipo);

router.get("/data/categorias", verify, checkRole([1]), product.getCategorias);
router.post("/data/categorias", verify, checkRole([1]), product.addCategoria);

router.get("/data/producto-base", verify, checkRole([1]), product.getProductoBase);
router.post("/data/producto-base", verify, checkRole([1]), product.addProductoBase);

router.get("/data/variantes/:categoria_id", verify, checkRole([1]), product.getVariantes);
router.post("/data/variantes", verify, checkRole([1]), product.addVariante);

router.get("/data/presentaciones", verify, checkRole([1]), product.getPresentaciones);
router.post("/data/presentaciones", verify, checkRole([1]), product.addPresentacion);

module.exports = router;
