// server/controllers/orderController.js
const pool = require("../models/db");
const { getOrCreateCart } = require("../utils/getOrCreateCart");

/* =====================================================
   GET /cart — Carrito del usuario
===================================================== */
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
        -- stock total por batch (sumando todas las bodegas)
        (
          SELECT SUM(i2.stock_cajas)
          FROM inventario i2
          WHERE i2.batch_id = ci.batch_id
        ) AS stock_cajas,
        pb.nombre AS producto_base,
        v.nombre AS variante,
        p.imagen
      FROM carrito_item ci
      INNER JOIN batch b 
        ON ci.batch_id = b.batch_id
      INNER JOIN producto_presentacion_codigo ppc
        ON ppc.producto_presentacion_codigo_id = b.producto_presentacion_codigo_id
      INNER JOIN producto_presentacion pp
        ON pp.producto_presentacion_id = ppc.producto_presentacion_id
      INNER JOIN producto p
        ON p.producto_id = pp.producto_id
      INNER JOIN producto_base pb
        ON pb.producto_base_id = p.producto_base_id
      INNER JOIN variante v
        ON v.variante_id = p.variante_id
      WHERE ci.carrito_id = ?
      `,
      [carrito_id]
    );

    res.json(items);
  } catch (err) {
    console.error("❌ Error en getCart:", err);
    res.status(500).json({ message: "Error al obtener carrito" });
  }
};

/* =====================================================
   POST /cart/add — Agregar producto al carrito
===================================================== */
exports.addItemToCart = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { batch_id, cantidad_cajas } = req.body;

    if (!batch_id || !cantidad_cajas) {
      return res.status(400).json({ message: "Faltan datos" });
    }

    const carrito_id = await getOrCreateCart(userId);

    // STOCK TOTAL DEL BATCH
    const [[inv]] = await pool.query(
      `
      SELECT SUM(stock_cajas) AS stock_total
      FROM inventario
      WHERE batch_id = ?
      `,
      [batch_id]
    );

    const stockTotal = Number(inv?.stock_total ?? 0);
    const cantidadNueva = Number(cantidad_cajas);

    if (!inv || inv.stock_total === null || stockTotal <= 0) {
      return res.status(400).json({ message: "Batch sin stock en inventario" });
    }

    // Ver si ya existe la línea en el carrito
    const [[item]] = await pool.query(
      `
      SELECT carrito_item_id, cantidad_cajas
      FROM carrito_item
      WHERE carrito_id = ? AND batch_id = ?
      `,
      [carrito_id, batch_id]
    );

    if (item) {
      const cantActual = Number(item.cantidad_cajas);
      const totalSolicitado = cantActual + cantidadNueva;

      if (totalSolicitado > stockTotal) {
        return res.status(400).json({
          message: `Stock insuficiente. Stock actual: ${stockTotal}, estás intentando dejar ${totalSolicitado}`,
        });
      }

      await pool.query(
        `
        UPDATE carrito_item
        SET cantidad_cajas = ?
        WHERE carrito_item_id = ?
        `,
        [totalSolicitado, item.carrito_item_id]
      );
    } else {
      if (cantidadNueva > stockTotal) {
        return res.status(400).json({
          message: `Stock insuficiente. Stock actual: ${stockTotal}, estás intentando agregar ${cantidadNueva}`,
        });
      }

      await pool.query(
        `
        INSERT INTO carrito_item (carrito_id, batch_id, cantidad_cajas)
        VALUES (?, ?, ?)
        `,
        [carrito_id, batch_id, cantidadNueva]
      );
    }

    res.json({ message: "Producto agregado al carrito" });
  } catch (err) {
    console.error("❌ Error en addItemToCart:", err);
    res.status(500).json({ message: "Error al agregar al carrito" });
  }
};

/* =====================================================
   DELETE /cart/item/:id — Eliminar ítem
===================================================== */
exports.removeItemFromCart = async (req, res) => {
  try {
    await pool.query("DELETE FROM carrito_item WHERE carrito_item_id = ?", [
      req.params.id,
    ]);

    res.json({ message: "Ítem eliminado" });
  } catch (err) {
    console.error("❌ Error removeItemFromCart:", err);
    res.status(500).json({ message: "Error al eliminar ítem" });
  }
};

/* =====================================================
   DELETE /cart/clear — Vaciar carrito
===================================================== */
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.uid;
    const carrito_id = await getOrCreateCart(userId);

    await pool.query("DELETE FROM carrito_item WHERE carrito_id = ?", [
      carrito_id,
    ]);

    res.json({ message: "Carrito vaciado" });
  } catch (err) {
    console.error("❌ Error clearCart:", err);
    res.status(500).json({ message: "Error al vaciar carrito" });
  }
};

/* =====================================================
   POST /cart/confirm — Crear pedido DESCONTANDO STOCK
===================================================== */
exports.createOrderFromCart = async (req, res) => {
  const conn = await pool.getConnection();

  try {
    const userId = req.user.uid;
    const carrito_id = await getOrCreateCart(userId);

    const [items] = await conn.query(
      "SELECT * FROM carrito_item WHERE carrito_id = ?",
      [carrito_id]
    );

    if (!items.length) {
      conn.release();
      return res.status(400).json({ message: "Carrito vacío" });
    }

    await conn.beginTransaction();

    const [{ insertId: pedidoId }] = await conn.query(
      "INSERT INTO pedido (user_id, estado_pedido) VALUES (?, 'Pendiente')",
      [userId]
    );

    for (const item of items) {
      const batchId = item.batch_id;
      const cantidadPedido = Number(item.cantidad_cajas);

      // 1) STOCK TOTAL DEL BATCH (BLOQUEADO)
      const [[inv]] = await conn.query(
        `
        SELECT SUM(stock_cajas) AS stock_total
        FROM inventario
        WHERE batch_id = ?
        FOR UPDATE
        `,
        [batchId]
      );

      const stockTotal = Number(inv?.stock_total ?? 0);

      console.log("🧮 Validando batch", batchId, {
        stockTotal,
        cantidadPedido,
      });

      if (!inv || inv.stock_total === null || stockTotal <= 0) {
        await conn.rollback();
        return res.status(400).json({
          message: `Batch ${batchId} no existe en inventario`,
        });
      }

      if (stockTotal < cantidadPedido) {
        await conn.rollback();
        return res.status(400).json({
          message: `Stock insuficiente para batch ${batchId}. Stock actual: ${stockTotal}, solicitado: ${cantidadPedido}`,
        });
      }

      // 2) DESCONTAR DE INVENTARIO (si más adelante tienes varias bodegas)
      let qtyToDiscount = cantidadPedido;

      const [rows] = await conn.query(
        `
        SELECT inventario_id, stock_cajas
        FROM inventario
        WHERE batch_id = ?
        ORDER BY stock_cajas DESC
        FOR UPDATE
        `,
        [batchId]
      );

      for (const row of rows) {
        if (qtyToDiscount <= 0) break;

        const disponible = Number(row.stock_cajas);
        const usar = Math.min(disponible, qtyToDiscount);

        await conn.query(
          `UPDATE inventario
           SET stock_cajas = stock_cajas - ?
           WHERE inventario_id = ?`,
          [usar, row.inventario_id]
        );

        qtyToDiscount -= usar;
      }

      // 3) INSERTAR ITEM DEL PEDIDO
      await conn.query(
        `
        INSERT INTO pedido_item (pedido_id, batch_id, cantidad_cajas)
        VALUES (?, ?, ?)
        `,
        [pedidoId, batchId, cantidadPedido]
      );
    }

    // 4) LIMPIAR CARRITO
    await conn.query("DELETE FROM carrito_item WHERE carrito_id = ?", [
      carrito_id,
    ]);

    await conn.commit();

    res.json({ message: "Pedido creado correctamente", pedidoId });
  } catch (err) {
    await conn.rollback();
    console.error("❌ ERROR CONFIRM:", err);
    res.status(500).json({ message: "Error al confirmar pedido" });
  } finally {
    conn.release();
  }
};

/* =====================================================
   GET /pedidos/my-orders — pedidos del usuario
===================================================== */
exports.getOrders = async (req, res) => {
  try {
    const userId = req.user.uid;

    const [rows] = await pool.query(
      "SELECT * FROM pedido WHERE user_id = ? ORDER BY fecha_creacion DESC",
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error("❌ Error getOrders:", err);
    res.status(500).json({ message: "Error al obtener pedidos" });
  }
};

/* =====================================================
   GET /pedidos/:pedidoId/items — items de un pedido
===================================================== */
exports.getOrderItems = async (req, res) => {
  try {
    const { pedidoId } = req.params;

    const [items] = await pool.query(
      `
      SELECT 
        pi.pedido_item_id,
        pi.cantidad_cajas,
        b.batch_id,
        b.codigo_lote,
        pb.nombre AS producto_base,
        v.nombre AS variante,
        p.imagen
      FROM pedido_item pi
      INNER JOIN batch b ON pi.batch_id = b.batch_id
      INNER JOIN producto_presentacion_codigo ppc 
        ON ppc.producto_presentacion_codigo_id = b.producto_presentacion_codigo_id
      INNER JOIN producto_presentacion pp 
        ON pp.producto_presentacion_id = ppc.producto_presentacion_id
      INNER JOIN producto p ON p.producto_id = pp.producto_id
      INNER JOIN producto_base pb ON pb.producto_base_id = p.producto_base_id
      INNER JOIN variante v ON v.variante_id = p.variante_id
      WHERE pi.pedido_id = ?;
      `,
      [pedidoId]
    );

    res.json(items);
  } catch (err) {
    console.error("❌ Error getOrderItems:", err);
    res.status(500).json({ message: "Error al obtener ítems del pedido" });
  }
};

/* =====================================================
   GET /admin/orders — TODOS LOS PEDIDOS
===================================================== */
exports.getAllOrders = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.pedido_id,
        p.user_id,
        u.name AS cliente,
        p.estado_pedido,
        p.fecha_creacion
      FROM pedido p
      INNER JOIN usuario u ON u.user_id = p.user_id
      ORDER BY p.fecha_creacion DESC;
    `);

    res.json(rows);
  } catch (err) {
    console.error("❌ Error getAllOrders:", err);
    res.status(500).json({ message: "Error al obtener pedidos" });
  }
};

/* =====================================================
   PUT /admin/pedido/:pedidoId/status
===================================================== */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { pedidoId } = req.params;
    const { estado } = req.body;

    const valid = ["Pendiente", "Procesado", "Entregado", "Cancelado"];

    if (!valid.includes(estado)) {
      return res.status(400).json({ message: "Estado inválido" });
    }

    await pool.query(
      "UPDATE pedido SET estado_pedido = ? WHERE pedido_id = ?",
      [estado, pedidoId]
    );

    res.json({ message: "Estado actualizado" });
  } catch (err) {
    console.error("❌ Error updateOrderStatus:", err);
    res.status(500).json({ message: "Error al actualizar estado del pedido" });
  }
};

/* =====================================================
   POST /admin/pedido/:pedidoId/process
===================================================== */
exports.processOrder = async (req, res) => {
  try {
    const { pedidoId } = req.params;

    await pool.query(
      "UPDATE pedido SET estado_pedido = 'Procesado' WHERE pedido_id = ?",
      [pedidoId]
    );

    res.json({ message: "Pedido procesado correctamente" });
  } catch (err) {
    console.error("❌ Error processOrder:", err);
    res.status(500).json({ message: "Error al procesar pedido" });
  }
};
