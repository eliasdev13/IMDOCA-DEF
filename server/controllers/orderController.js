// controllers/orderController.js
const pool = require("../models/db");

// ==============================
// HELPER: obtener o crear carrito
// ==============================
async function getOrCreateCart(userId) {
  // Busca el carrito más reciente de ese usuario
  const [rows] = await pool.query(
    `SELECT carrito_id 
     FROM carrito 
     WHERE user_id = ?
     ORDER BY fecha_creacion DESC
     LIMIT 1`,
    [userId]
  );

  if (rows.length > 0) return rows[0].carrito_id;

  // Si no existe, crea uno
  const [result] = await pool.query(
    `INSERT INTO carrito (user_id) VALUES (?)`,
    [userId]
  );

  return result.insertId;
}

// ==============================
// OBTENER CARRITO DEL USUARIO
// ==============================
// GET /cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.uid;

    const carrito_id = await getOrCreateCart(userId);

    const [items] = await pool.query(
      `
      SELECT 
        ci.carrito_item_id,
        ci.batch_id,
        ci.cantidad_cajas,
        b.codigo_lote,
        b.fecha_vencimiento,
        p.producto_id,
        pb.nombre AS producto_base,
        v.nombre AS variante,
        pr.nombre AS presentacion,
        c.codigo AS codigo_empaque
      FROM carrito_item ci
      INNER JOIN batch b ON ci.batch_id = b.batch_id
      INNER JOIN producto_presentacion_codigo ppc ON b.producto_presentacion_codigo_id = ppc.producto_presentacion_codigo_id
      INNER JOIN codigo c ON ppc.codigo_id = c.codigo_id
      INNER JOIN producto_presentacion pp ON ppc.producto_presentacion_id = pp.producto_presentacion_id
      INNER JOIN producto p ON pp.producto_id = p.producto_id
      INNER JOIN producto_base pb ON p.producto_base_id = pb.producto_base_id
      INNER JOIN variante v ON p.variante_id = v.variante_id
      INNER JOIN presentacion pr ON pp.presentacion_id = pr.presentacion_id
      WHERE ci.carrito_id = ?
      `,
      [carrito_id]
    );

    res.json({
      carrito_id,
      items
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener carrito", error: err });
  }
};

// ==============================
// AGREGAR ÍTEM AL CARRITO
// ==============================
// POST /cart/add
// Body:
// {
//   "batch_id": 5,
//   "cantidad_cajas": 3
// }
exports.addItemToCart = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { batch_id, cantidad_cajas } = req.body;

    if (!batch_id || !cantidad_cajas) {
      return res.status(400).json({ message: "Faltan datos (batch_id, cantidad_cajas)" });
    }

    const carrito_id = await getOrCreateCart(userId);

    // Si ya existe ese batch en el carrito, sumamos cantidad
    const [rows] = await pool.query(
      `SELECT carrito_item_id, cantidad_cajas 
       FROM carrito_item 
       WHERE carrito_id = ? AND batch_id = ?`,
      [carrito_id, batch_id]
    );

    if (rows.length > 0) {
      const nuevaCantidad = Number(rows[0].cantidad_cajas) + Number(cantidad_cajas);
      await pool.query(
        `UPDATE carrito_item 
         SET cantidad_cajas = ? 
         WHERE carrito_item_id = ?`,
        [nuevaCantidad, rows[0].carrito_item_id]
      );
    } else {
      await pool.query(
        `INSERT INTO carrito_item (carrito_id, batch_id, cantidad_cajas)
         VALUES (?, ?, ?)`,
        [carrito_id, batch_id, cantidad_cajas]
      );
    }

    res.status(201).json({ message: "Producto agregado al carrito", carrito_id });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al agregar al carrito", error: err });
  }
};

// ==============================
// CREAR PEDIDO DESDE CARRITO
// ==============================
// POST /cart/confirm
// Body:
// { "comentario_cliente": "Entregar en horario AM" }
exports.createOrderFromCart = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const userId = req.user.uid;
    const { comentario_cliente } = req.body || {};

    const carrito_id = await getOrCreateCart(userId);

    // Obtenemos ítems del carrito
    const [items] = await conn.query(
      `SELECT batch_id, cantidad_cajas 
       FROM carrito_item 
       WHERE carrito_id = ?`,
      [carrito_id]
    );

    if (!items.length) {
      conn.release();
      return res.status(400).json({ message: "El carrito está vacío" });
    }

    await conn.beginTransaction();

    // 1️⃣ Crear pedido
    const [pedidoResult] = await conn.query(
      `INSERT INTO pedido (user_id, estado_pedido, comentario_cliente)
       VALUES (?, 'Pendiente', ?)`,
      [userId, comentario_cliente || null]
    );

    const pedido_id = pedidoResult.insertId;

    // 2️⃣ Crear pedido_item desde carrito_item
    for (const item of items) {
      await conn.query(
        `INSERT INTO pedido_item (pedido_id, batch_id, cantidad_cajas)
         VALUES (?, ?, ?)`,
        [pedido_id, item.batch_id, item.cantidad_cajas]
      );
    }

    // 3️⃣ Vaciar carrito (opcional: puedes borrar solo items)
    await conn.query(`DELETE FROM carrito_item WHERE carrito_id = ?`, [carrito_id]);

    await conn.commit();
    conn.release();

    res.status(201).json({ message: "Pedido creado correctamente", pedido_id });

  } catch (err) {
    console.error(err);
    try { await conn.rollback(); } catch (e) {}
    conn.release();
    res.status(500).json({ message: "Error al crear pedido desde carrito", error: err });
  }
};

// ==============================
// OBTENER PEDIDOS DEL USUARIO
// ==============================
// GET /pedidos/mis-pedidos
exports.getOrders = async (req, res) => {
  try {
    const userId = req.user.uid;

    const [rows] = await pool.query(
      `SELECT 
        pedido_id, user_id, estado_pedido, comentario_cliente, fecha_creacion
       FROM pedido
       WHERE user_id = ?
       ORDER BY fecha_creacion DESC`,
      [userId]
    );

    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener pedidos", error: err });
  }
};

// ==============================
// OBTENER ITEMS DE UN PEDIDO
// ==============================
// GET /pedido/:pedidoId/items
exports.getOrderItems = async (req, res) => {
  try {
    const { pedidoId } = req.params;
    const userId = req.user.uid;
    const roleId = req.user.roleId; // viene del JWT

    // Validar que el pedido sea del usuario si es cliente (rol 3)
    const [pedidos] = await pool.query(
      `SELECT user_id FROM pedido WHERE pedido_id = ?`,
      [pedidoId]
    );
    if (!pedidos.length) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }
    if (roleId === 3 && pedidos[0].user_id !== userId) {
      return res.status(403).json({ message: "No autorizado para ver este pedido" });
    }

    const [rows] = await pool.query(
      `
      SELECT 
        pi.pedido_item_id,
        pi.batch_id,
        pi.cantidad_cajas,
        b.codigo_lote,
        b.fecha_vencimiento,
        p.producto_id,
        pb.nombre AS producto_base,
        v.nombre AS variante,
        pr.nombre AS presentacion,
        c.codigo AS codigo_empaque
      FROM pedido_item pi
      INNER JOIN batch b ON pi.batch_id = b.batch_id
      INNER JOIN producto_presentacion_codigo ppc ON b.producto_presentacion_codigo_id = ppc.producto_presentacion_codigo_id
      INNER JOIN codigo c ON ppc.codigo_id = c.codigo_id
      INNER JOIN producto_presentacion pp ON ppc.producto_presentacion_id = pp.producto_presentacion_id
      INNER JOIN producto p ON pp.producto_id = p.producto_id
      INNER JOIN producto_base pb ON p.producto_base_id = pb.producto_base_id
      INNER JOIN variante v ON p.variante_id = v.variante_id
      INNER JOIN presentacion pr ON pp.presentacion_id = pr.presentacion_id
      WHERE pi.pedido_id = ?
      `,
      [pedidoId]
    );

    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener items del pedido", error: err });
  }
};

// ==============================
// ACTUALIZAR ESTADO DE PEDIDO
// ==============================
// PUT /pedido/:pedidoId/status
// Body: { "estado_pedido": "Procesado" }
exports.updateOrderStatus = async (req, res) => {
  try {
    const { pedidoId } = req.params;
    const { estado_pedido } = req.body;

    const estadosValidos = ["Pendiente", "Procesado", "Entregado", "Cancelado"];
    if (!estadosValidos.includes(estado_pedido)) {
      return res.status(400).json({ message: "Estado no válido" });
    }

    const [result] = await pool.query(
      `UPDATE pedido 
       SET estado_pedido = ? 
       WHERE pedido_id = ?`,
      [estado_pedido, pedidoId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    res.json({ message: "Estado de pedido actualizado" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al actualizar estado de pedido", error: err });
  }
};

// ==============================
// PROCESAR PEDIDO: DESCONTAR STOCK
// ==============================
// POST /pedido/:pedidoId/process
// Body:
// {
//   "bodega_id": 1,
//   "responsable_salida": "Operador X",
//   "comentario": "Despacho normal"
// }
exports.processOrder = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { pedidoId } = req.params;
    const { bodega_id, responsable_salida, comentario } = req.body;

    if (!bodega_id) {
      conn.release();
      return res.status(400).json({ message: "bodega_id es obligatorio" });
    }

    // Obtenemos pedido
    const [pedidos] = await conn.query(
      `SELECT user_id, estado_pedido 
       FROM pedido 
       WHERE pedido_id = ?`,
      [pedidoId]
    );
    if (!pedidos.length) {
      conn.release();
      return res.status(404).json({ message: "Pedido no encontrado" });
    }
    if (pedidos[0].estado_pedido !== "Pendiente") {
      conn.release();
      return res.status(400).json({ message: "Solo se pueden procesar pedidos Pendientes" });
    }

    const user_id = pedidos[0].user_id;

    // Buscar cliente (opcional, si existe)
    const [clientes] = await conn.query(
      `SELECT cliente_id FROM cliente WHERE user_id = ?`,
      [user_id]
    );
    const cliente_id = clientes.length ? clientes[0].cliente_id : null;

    // Obtener items del pedido
    const [items] = await conn.query(
      `SELECT batch_id, cantidad_cajas 
       FROM pedido_item 
       WHERE pedido_id = ?`,
      [pedidoId]
    );
    if (!items.length) {
      conn.release();
      return res.status(400).json({ message: "El pedido no tiene items" });
    }

    await conn.beginTransaction();

    // 1️⃣ Validar y descontar stock + crear SALIDA por cada item
    for (const item of items) {
      const { batch_id, cantidad_cajas } = item;

      // Ver stock
      const [invRows] = await conn.query(
        `SELECT inventario_id, stock_cajas 
         FROM inventario 
         WHERE batch_id = ? AND bodega_id = ?`,
        [batch_id, bodega_id]
      );

      if (!invRows.length) {
        await conn.rollback();
        conn.release();
        return res.status(400).json({
          message: `No hay inventario para batch ${batch_id} en bodega ${bodega_id}`
        });
      }

      const stockActual = Number(invRows[0].stock_cajas);
      if (stockActual < Number(cantidad_cajas)) {
        await conn.rollback();
        conn.release();
        return res.status(400).json({
          message: `Stock insuficiente para batch ${batch_id} en bodega ${bodega_id}`
        });
      }

      const nuevoStock = stockActual - Number(cantidad_cajas);

      // Insertar en SALIDA
      await conn.query(
        `INSERT INTO salida (
          batch_id, bodega_id, responsable_salida, cantidad_cajas,
          cliente_id, comentario
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          batch_id,
          bodega_id,
          responsable_salida || null,
          cantidad_cajas,
          cliente_id,
          comentario || null
        ]
      );

      // Actualizar inventario
      await conn.query(
        `UPDATE inventario 
         SET stock_cajas = ? 
         WHERE inventario_id = ?`,
        [nuevoStock, invRows[0].inventario_id]
      );
    }

    // 2️⃣ Actualizar estado del pedido
    await conn.query(
      `UPDATE pedido 
       SET estado_pedido = 'Procesado' 
       WHERE pedido_id = ?`,
      [pedidoId]
    );

    await conn.commit();
    conn.release();

    res.json({ message: "Pedido procesado y stock descontado correctamente" });

  } catch (err) {
    console.error(err);
    try { await conn.rollback(); } catch (e) {}
    conn.release();
    res.status(500).json({ message: "Error al procesar pedido", error: err });
  }
};
