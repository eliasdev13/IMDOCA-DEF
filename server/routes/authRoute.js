// routes/index.js
const express = require('express');
const router = express.Router();
const upload = require("../middleware/uploadImage");

// Middlewares
const validation = require('../middleware/joiValidation');
const { verify } = require('../middleware/verify');
const { checkRole } = require("../middleware/roles");

// Schemas
const { registerUserSchema  } = require('../schemas/registeruser');
const { registerClientSchema  } = require('../schemas/registerclient');

// Controllers
const auth = require('../controllers/authController');
const userCtrl = require('../controllers/userController');
const product = require('../controllers/productController');
const inventory = require('../controllers/inventoryController');
const order = require('../controllers/orderController');

// ========================
// AUTH
// ========================
router.post('/login', auth.login);
router.post('/refresh', auth.refresh);
router.post('/logout', verify, auth.logout);

// ========================
// USERS
// ========================
router.post("/createUser", validation(registerUserSchema), userCtrl.createUser);
router.post("/createClient", validation(registerClientSchema), verify, userCtrl.createClient);
router.get("/user/profile", verify, userCtrl.getProfile);
router.get("/users", verify, checkRole([1]), userCtrl.getAllUsers);
router.get("/user/:id", verify, checkRole([1]), userCtrl.getUserById);
router.get("/client/:id", verify, checkRole([1,2]), userCtrl.getClient);
router.get("/clients", verify, checkRole([1]), userCtrl.getAllClients);
router.put("/user/:id", verify, checkRole([1]), userCtrl.updateUser);
router.put("/client/:id", verify, checkRole([1]), userCtrl.updateClient);

// ========================
// PRODUCTOS
// ========================
router.post("/product", verify, upload.single("imagen"), checkRole([1,2]), product.createProduct);
router.get("/product/:id", verify, product.getProductById);
//router.put("/product/:id", verify, checkRole([1,2]), product.updateProduct);
//router.delete("/product/:id", verify, checkRole([1]), product.deleteProduct);
router.get('/products', verify, product.getAllProducts);

// ========================
// INVENTARIO
// ========================
router.get("/inventario/all", verify, checkRole([1,2]), inventory.getAllInventory);
router.post("/inventario/addStock", verify, checkRole([1,2]), inventory.addStock);
router.post("/inventario/removeStock", verify, checkRole([1,2]), inventory.removeStock);

// ========================
// PALLETS
// ========================
//router.post("/pallet", verify, checkRole([1,2]), inventory.registerPallet);

// ========================
// CARRITO
// ========================
router.get("/cart", verify, checkRole([2]), order.getCart);
router.post("/cart/add", verify, checkRole([2]), order.addItemToCart);
router.post("/cart/confirm", verify, checkRole([2]), order.createOrderFromCart);
//router.delete("/cart/clear", verify, checkRole([3]), order.clearCart);
//router.delete("/cart/item", verify, checkRole([3]), order.removeItemFromCart);

// ========================
// PEDIDOS
// ========================
//router.get("/pedidos/pendientes", verify, checkRole([1,2]), order.getPedidosPendientes);
router.get("/pedidos/mis-pedidos", verify, checkRole([3]), order.getOrders);
router.get("/pedido/:pedidoId/items", verify, order.getOrderItems);
router.put("/pedido/:pedidoId/status", verify, checkRole([1,2]), order.updateOrderStatus);

// ========================
// PROCESAR PEDIDO
// ========================
router.post("/pedido/:pedidoId/process", verify, checkRole([1,2]), order.processOrder);

module.exports = router;
