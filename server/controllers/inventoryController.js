// controllers/inventoryController.js
const pool = require("../models/db");

// ==============================
// HELPER: obtener o crear batch
// ==============================
async function getOrCreateBatch({
  producto_presentacion_codigo_id,
  codigo_lote,
  fecha_elaboracion,
  fecha_vencimiento
}) {
  // Buscamos si ya existe ese batch (mismo producto + mismo lote)
  const [rows] = await pool.query(
    `SELECT batch_id 
     FROM batch 
     WHERE producto_presentacion_codigo_id = ? 
       AND codigo_lote = ?`,
    [producto_presentacion_codigo_id, codigo_lote]
  );

  if (rows.length > 0) return rows[0].batch_id;

  // Si no existe, lo creamos
  const [result] = await pool.query(
    `INSERT INTO batch (
        producto_presentacion_codigo_id, 
        codigo_lote, 
        fecha_elaboracion, 
        fecha_vencimiento
      ) VALUES (?, ?, ?, ?)`,
    [producto_presentacion_codigo_id, codigo_lote, fecha_elaboracion, fecha_vencimiento]
  );

  return result.insertId;
}

// ==============================
// AGREGAR STOCK (ENTRADA)
// ==============================
// Body esperado:
// {
//   "producto_presentacion_codigo_id": 1,
//   "codigo_lote": "L8-94 12:57 01T",
//   "fecha_elaboracion": "2025-04-04",
//   "fecha_vencimiento": "2025-11-30",
//   "bodega_id": 1,
//   "cantidad_cajas": 35,
//   "guia_despacho": "N°214989",
//   "factura_proveedor": "CFR-CL 001/25",
//   "codigo_datador": "L8-94 12:57 01T"
// }
exports.addStock = async (req, res) => {
  try {
    const {
      producto_presentacion_codigo_id,
      codigo_lote,
      fecha_elaboracion,
      fecha_vencimiento,
      bodega_id,
      cantidad_cajas,
      guia_despacho,
      factura_proveedor,
      codigo_datador
    } = req.body;

    if (!producto_presentacion_codigo_id || !codigo_lote || !bodega_id || !cantidad_cajas) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    // 1️⃣ Obtenemos o creamos el batch
    const batch_id = await getOrCreateBatch({
      producto_presentacion_codigo_id,
      codigo_lote,
      fecha_elaboracion,
      fecha_vencimiento
    });

    // 2️⃣ Insertamos en ENTRADA
    await pool.query(
      `INSERT INTO entrada (
        batch_id, bodega_id, guia_despacho, factura_proveedor, 
        cantidad_cajas, codigo_datador
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        batch_id,
        bodega_id,
        guia_despacho || null,
        factura_proveedor || null,
        cantidad_cajas,
        codigo_datador || null
      ]
    );

    // 3️⃣ Actualizamos / creamos registro en INVENTARIO
    const [invRows] = await pool.query(
      `SELECT inventario_id, stock_cajas 
       FROM inventario 
       WHERE batch_id = ? AND bodega_id = ?`,
      [batch_id, bodega_id]
    );

    if (invRows.length > 0) {
      const nuevoStock = Number(invRows[0].stock_cajas) + Number(cantidad_cajas);
      await pool.query(
        `UPDATE inventario 
         SET stock_cajas = ? 
         WHERE inventario_id = ?`,
        [nuevoStock, invRows[0].inventario_id]
      );
    } else {
      await pool.query(
        `INSERT INTO inventario (batch_id, bodega_id, stock_cajas) 
         VALUES (?, ?, ?)`,
        [batch_id, bodega_id, cantidad_cajas]
      );
    }

    res.status(201).json({
      message: "Stock agregado correctamente",
      batch_id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al agregar stock", error: err });
  }
};

// ==============================
// REMOVER STOCK (SALIDA MANUAL)
// ==============================
// Body esperado:
// {
//   "batch_id": 5,
//   "bodega_id": 1,
//   "cantidad_cajas": 10,
//   "responsable_salida": "Juan Pérez",
//   "cliente_id": 3,        // opcional
//   "comentario": "Ajuste",
//   "codigo_datador": "L8-94 12:57 01T"
// }
exports.removeStock = async (req, res) => {
  try {
    const {
      batch_id,
      bodega_id,
      cantidad_cajas,
      responsable_salida,
      cliente_id,
      comentario,
      codigo_datador
    } = req.body;

    if (!batch_id || !bodega_id || !cantidad_cajas) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    // 1️⃣ Verificar inventario actual
    const [invRows] = await pool.query(
      `SELECT inventario_id, stock_cajas 
       FROM inventario 
       WHERE batch_id = ? AND bodega_id = ?`,
      [batch_id, bodega_id]
    );

    if (!invRows.length) {
      return res.status(400).json({ message: "No existe inventario para ese batch y bodega" });
    }

    const stockActual = Number(invRows[0].stock_cajas);
    if (stockActual < Number(cantidad_cajas)) {
      return res.status(400).json({ message: "Stock insuficiente" });
    }

    // 2️⃣ Insertar en SALIDA
    await pool.query(
      `INSERT INTO salida (
        batch_id, bodega_id, responsable_salida, cantidad_cajas,
        cliente_id, comentario, codigo_datador
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        batch_id,
        bodega_id,
        responsable_salida || null,
        cantidad_cajas,
        cliente_id || null,
        comentario || null,
        codigo_datador || null
      ]
    );

    // 3️⃣ Actualizar inventario
    const nuevoStock = stockActual - Number(cantidad_cajas);
    await pool.query(
      `UPDATE inventario 
       SET stock_cajas = ? 
       WHERE inventario_id = ?`,
      [nuevoStock, invRows[0].inventario_id]
    );

    res.json({ message: "Stock descontado correctamente", nuevoStock });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al descontar stock", error: err });
  }
};

// ==============================
// OBTENER STOCK POR BODEGA
// ==============================
// GET /inventario/:bodega_id
exports.getStockByBodega = async (req, res) => {
  try {
    const { bodega_id } = req.params;

    const [rows] = await pool.query(
      `
      SELECT 
        i.inventario_id,
        i.stock_cajas,
        b.batch_id,
        b.codigo_lote,
        b.fecha_elaboracion,
        b.fecha_vencimiento,
        b.estado,
        p.producto_id,
        pb.nombre AS producto_base,
        v.nombre AS variante,
        pr.nombre AS presentacion,
        c.codigo AS codigo_empaque
      FROM inventario i
      INNER JOIN batch b ON i.batch_id = b.batch_id
      INNER JOIN producto_presentacion_codigo ppc ON b.producto_presentacion_codigo_id = ppc.producto_presentacion_codigo_id
      INNER JOIN codigo c ON ppc.codigo_id = c.codigo_id
      INNER JOIN producto_presentacion pp ON ppc.producto_presentacion_id = pp.producto_presentacion_id
      INNER JOIN producto p ON pp.producto_id = p.producto_id
      INNER JOIN producto_base pb ON p.producto_base_id = pb.producto_base_id
      INNER JOIN variante v ON p.variante_id = v.variante_id
      INNER JOIN presentacion pr ON pp.presentacion_id = pr.presentacion_id
      WHERE i.bodega_id = ?
      `,
      [bodega_id]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener inventario por bodega", error: err });
  }
};

// ==============================
// OBTENER TODO EL INVENTARIO
// ==============================
// GET /inventario/allInventory
exports.getAllInventory = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT 
        i.inventario_id,
        i.stock_cajas,
        i.bodega_id,
        bd.nombre AS bodega_nombre,
        b.batch_id,
        b.codigo_lote,
        b.fecha_elaboracion,
        b.fecha_vencimiento,
        b.estado,
        p.producto_id,
        pb.nombre AS producto_base,
        v.nombre AS variante,
        pr.nombre AS presentacion,
        c.codigo AS codigo_empaque
      FROM inventario i
      INNER JOIN bodega bd ON i.bodega_id = bd.bodega_id
      INNER JOIN batch b ON i.batch_id = b.batch_id
      INNER JOIN producto_presentacion_codigo ppc ON b.producto_presentacion_codigo_id = ppc.producto_presentacion_codigo_id
      INNER JOIN codigo c ON ppc.codigo_id = c.codigo_id
      INNER JOIN producto_presentacion pp ON ppc.producto_presentacion_id = pp.producto_presentacion_id
      INNER JOIN producto p ON pp.producto_id = p.producto_id
      INNER JOIN producto_base pb ON p.producto_base_id = pb.producto_base_id
      INNER JOIN variante v ON p.variante_id = v.variante_id
      INNER JOIN presentacion pr ON pp.presentacion_id = pr.presentacion_id
      `
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener inventario", error: err });
  }
};
