// server/controllers/inventoryController.js
const pool = require("../models/db");

/* =====================================================
   GET /inventario/all
   Lista de inventario por batch (con producto, variante, presentación, EAN14)
===================================================== */
exports.getAllInventory = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        inv.inventario_id,
        inv.batch_id,
        inv.bodega_id,
        inv.stock_cajas,
        inv.fecha_actualizacion,
        b.codigo_lote,
        b.fecha_vencimiento,
        b.fecha_elaboracion,
        bod.nombre AS bodega,
        p.imagen,
        pb.nombre AS producto_base,
        v.nombre AS variante,
        pr.nombre AS presentacion,
        c.codigo AS ean14
      FROM inventario inv
      INNER JOIN batch b 
        ON b.batch_id = inv.batch_id
      INNER JOIN bodega bod
        ON bod.bodega_id = inv.bodega_id
      INNER JOIN producto_presentacion_codigo ppc 
        ON ppc.producto_presentacion_codigo_id = b.producto_presentacion_codigo_id
      INNER JOIN codigo c 
        ON c.codigo_id = ppc.codigo_id AND c.tipo_codigo = 'EAN14'
      INNER JOIN producto_presentacion pp 
        ON pp.producto_presentacion_id = ppc.producto_presentacion_id
      INNER JOIN producto p 
        ON p.producto_id = pp.producto_id
      INNER JOIN producto_base pb 
        ON pb.producto_base_id = p.producto_base_id
      INNER JOIN variante v 
        ON v.variante_id = p.variante_id
      INNER JOIN presentacion pr 
        ON pr.presentacion_id = pp.presentacion_id
      ORDER BY b.fecha_vencimiento ASC;
    `);

    res.json(rows);

  } catch (err) {
    console.error("❌ Error getAllInventory:", err);
    res.status(500).json({ message: "Error al obtener inventario" });
  }
};

/* =====================================================
   POST /inventario/addStock
   Sumar stock a un batch EXISTENTE
===================================================== */
exports.addStock = async (req, res) => {
  try {
    // Soporta { batch_id, cantidad } o { batch_id, cantidad_cajas }
    const { batch_id, cantidad, cantidad_cajas } = req.body;

    const qty = Number(cantidad_cajas ?? cantidad);

    if (!batch_id || !qty || qty <= 0)
      return res.status(400).json({
        message: "batch_id y cantidad (>0) son requeridos",
      });

    const [[inv]] = await pool.query(
      "SELECT inventario_id, stock_cajas FROM inventario WHERE batch_id = ?",
      [batch_id]
    );

    if (!inv)
      return res
        .status(404)
        .json({ message: "Batch no encontrado en inventario" });

    await pool.query(
      "UPDATE inventario SET stock_cajas = stock_cajas + ? WHERE inventario_id = ?",
      [qty, inv.inventario_id]
    );

    res.json({ message: "Stock agregado correctamente" });
  } catch (err) {
    console.error("❌ Error addStock:", err);
    res.status(500).json({ message: "Error al agregar stock" });
  }
};

/* =====================================================
   POST /inventario/removeStock
   Restar stock a un batch EXISTENTE
===================================================== */
exports.removeStock = async (req, res) => {
  try {
    // Soporta { batch_id, cantidad } o { batch_id, cantidad_cajas }
    const { batch_id, cantidad, cantidad_cajas } = req.body;

    const qty = Number(cantidad_cajas ?? cantidad);

    if (!batch_id || !qty || qty <= 0)
      return res.status(400).json({
        message: "batch_id y cantidad (>0) son requeridos",
      });

    const [[inv]] = await pool.query(
      "SELECT inventario_id, stock_cajas FROM inventario WHERE batch_id = ?",
      [batch_id]
    );

    if (!inv)
      return res
        .status(404)
        .json({ message: "Batch no encontrado en inventario" });

    if (inv.stock_cajas < qty)
      return res.status(400).json({ message: "Stock insuficiente" });

    await pool.query(
      "UPDATE inventario SET stock_cajas = stock_cajas - ? WHERE inventario_id = ?",
      [qty, inv.inventario_id]
    );

    res.json({ message: "Stock restado correctamente" });
  } catch (err) {
    console.error("❌ Error removeStock:", err);
    res.status(500).json({ message: "Error al restar stock" });
  }
};

/* =====================================================
   POST /inventario/ingresar
   Flujo completo de ingreso de mercadería:
   - Busca EAN14 → producto_presentacion_codigo
   - Crea o reutiliza batch
   - Inserta entrada
   - Crea/actualiza inventario
===================================================== */
exports.ingresarMercaderia = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const {
      ean14,
      bodega_id,
      cantidad_cajas,
      codigo_lote,
      fecha_elaboracion,  // 'YYYY-MM-DD'
      fecha_vencimiento,  // 'YYYY-MM-DD'
      guia_despacho,
      factura_proveedor,
      codigo_datador,
    } = req.body;

    if (
      !ean14 ||
      !bodega_id ||
      !cantidad_cajas ||
      !codigo_lote ||
      !fecha_elaboracion ||
      !fecha_vencimiento
    ) {
      return res.status(400).json({
        message:
          "ean14, bodega_id, cantidad_cajas, codigo_lote, fecha_elaboracion y fecha_vencimiento son obligatorios",
      });
    }

    const qty = Number(cantidad_cajas);
    if (qty <= 0)
      return res.status(400).json({ message: "cantidad_cajas debe ser > 0" });

    await conn.beginTransaction();

    // 1) Buscar código EAN14
    const [[codigoRow]] = await conn.query(
      "SELECT codigo_id FROM codigo WHERE tipo_codigo = 'EAN14' AND codigo = ?",
      [ean14]
    );

    if (!codigoRow) {
      await conn.rollback();
      return res.status(404).json({
        message: `No se encontró código EAN14 = ${ean14}`,
      });
    }

    // 2) Buscar producto_presentacion_codigo (nivel CAJA)
    const [[ppc]] = await conn.query(
      `
      SELECT producto_presentacion_codigo_id, producto_presentacion_id
      FROM producto_presentacion_codigo
      WHERE codigo_id = ? AND nivel_empaque = 'CAJA'
    `,
      [codigoRow.codigo_id]
    );

    if (!ppc) {
      await conn.rollback();
      return res.status(404).json({
        message: "No existe producto_presentacion_codigo con ese EAN14 (CAJA)",
      });
    }

    const producto_presentacion_codigo_id =
      ppc.producto_presentacion_codigo_id;

    // 3) Buscar o crear batch (lote)
    const [[batchRow]] = await conn.query(
      `
      SELECT batch_id 
      FROM batch
      WHERE producto_presentacion_codigo_id = ?
        AND codigo_lote = ?
    `,
      [producto_presentacion_codigo_id, codigo_lote]
    );

    let batch_id;

    if (batchRow) {
      batch_id = batchRow.batch_id;
    } else {
      const [insertBatch] = await conn.query(
        `
        INSERT INTO batch
          (producto_presentacion_codigo_id, codigo_lote, fecha_elaboracion, fecha_vencimiento, estado)
        VALUES (?, ?, ?, ?, 'Disponible')
      `,
        [
          producto_presentacion_codigo_id,
          codigo_lote,
          fecha_elaboracion,
          fecha_vencimiento,
        ]
      );
      batch_id = insertBatch.insertId;
    }

    // 4) Insertar ENTRADA
    await conn.query(
      `
      INSERT INTO entrada
        (batch_id, bodega_id, fecha_entrada, guia_despacho, factura_proveedor, cantidad_cajas, codigo_datador)
      VALUES (?, ?, NOW(), ?, ?, ?, ?)
    `,
      [
        batch_id,
        bodega_id,
        guia_despacho || null,
        factura_proveedor || null,
        qty,
        codigo_datador || null,
      ]
    );

    // 5) Actualizar o crear INVENTARIO
    const [[inv]] = await conn.query(
      `
      SELECT inventario_id, stock_cajas 
      FROM inventario
      WHERE batch_id = ? AND bodega_id = ?
    `,
      [batch_id, bodega_id]
    );

    if (inv) {
      await conn.query(
        `
        UPDATE inventario 
        SET stock_cajas = stock_cajas + ?
        WHERE inventario_id = ?
      `,
        [qty, inv.inventario_id]
      );
    } else {
      await conn.query(
        `
        INSERT INTO inventario (batch_id, bodega_id, stock_cajas)
        VALUES (?, ?, ?)
      `,
        [batch_id, bodega_id, qty]
      );
    }

    await conn.commit();

    res.json({
      message: "Mercadería ingresada correctamente",
      batch_id,
    });
  } catch (err) {
    await conn.rollback();
    console.error("❌ Error ingresarMercaderia:", err);
    res.status(500).json({ message: "Error al ingresar mercadería" });
  } finally {
    conn.release();
  }
};
