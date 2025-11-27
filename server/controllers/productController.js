const pool = require("../models/db");

/* =====================================================
   CREAR PRODUCTO COMPLETO
===================================================== */
exports.createProduct = async (req, res) => {
  const conn = await pool.getConnection();

  try {
    const {
      tipo,
      categoria,
      producto_base,
      variante,
      presentacion
    } = req.body;

    const imagen = req.file?.filename || null;

    if (!tipo || !categoria || !producto_base || !variante || !presentacion) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    await conn.beginTransaction();

    // ----------------------------- 1) TIPO -----------------------------
    let [tipoRow] = await conn.query(
      "SELECT tipo_id FROM tipo WHERE nombre = ?",
      [tipo]
    );
    const tipo_id = tipoRow.length
      ? tipoRow[0].tipo_id
      : (await conn.query(
          "INSERT INTO tipo (nombre) VALUES (?)",
          [tipo]
        ))[0].insertId;

    // ----------------------------- 2) CATEGORIA -----------------------------
    let [catRow] = await conn.query(
      "SELECT categoria_id FROM categoria WHERE nombre = ?",
      [categoria]
    );
    const categoria_id = catRow.length
      ? catRow[0].categoria_id
      : (await conn.query(
          "INSERT INTO categoria (nombre) VALUES (?)",
          [categoria]
        ))[0].insertId;

    // ----------------------------- 3) PRODUCTO BASE -----------------------------
    let [pbRow] = await conn.query(
      "SELECT producto_base_id FROM producto_base WHERE nombre = ? AND tipo_id = ?",
      [producto_base, tipo_id]
    );
    const producto_base_id = pbRow.length
      ? pbRow[0].producto_base_id
      : (await conn.query(
          "INSERT INTO producto_base (nombre, tipo_id) VALUES (?, ?)",
          [producto_base, tipo_id]
        ))[0].insertId;

    // ----------------------------- 4) VARIANTE -----------------------------
    let [varRow] = await conn.query(
      "SELECT variante_id FROM variante WHERE nombre = ? AND categoria_id = ?",
      [variante, categoria_id]
    );
    const variante_id = varRow.length
      ? varRow[0].variante_id
      : (await conn.query(
          "INSERT INTO variante (categoria_id, nombre) VALUES (?, ?)",
          [categoria_id, variante]
        ))[0].insertId;

    // ----------------------------- 5) PRODUCTO -----------------------------
    let [prodRow] = await conn.query(
      "SELECT producto_id FROM producto WHERE producto_base_id = ? AND variante_id = ?",
      [producto_base_id, variante_id]
    );

    const producto_id = prodRow.length
      ? prodRow[0].producto_id
      : (await conn.query(
          "INSERT INTO producto (producto_base_id, variante_id, imagen) VALUES (?, ?, ?)",
          [producto_base_id, variante_id, imagen]
        ))[0].insertId;

    // ----------------------------- 6) PRESENTACIÓN (CAJA) -----------------------------
    let [presRow] = await conn.query(
      "SELECT presentacion_id FROM presentacion WHERE nombre = ?",
      [presentacion]
    );
    const presentacion_id = presRow.length
      ? presRow[0].presentacion_id
      : (await conn.query(
          "INSERT INTO presentacion (nombre) VALUES (?)",
          [presentacion]
        ))[0].insertId;

    // ----------------------------- 7) producto_presentacion -----------------------------
    let [ppRow] = await conn.query(
      `SELECT producto_presentacion_id 
       FROM producto_presentacion 
       WHERE producto_id = ? AND presentacion_id = ?`,
      [producto_id, presentacion_id]
    );

    const producto_presentacion_id = ppRow.length
      ? ppRow[0].producto_presentacion_id
      : (await conn.query(
          `INSERT INTO producto_presentacion (producto_id, presentacion_id, cantidad)
           VALUES (?, ?, 0)`,
          [producto_id, presentacion_id]
        ))[0].insertId;

    await conn.commit();

    res.json({
      message: "Producto creado correctamente",
      producto_id,
      producto_presentacion_id,
      presentacion_id
    });

  } catch (err) {
    await conn.rollback();
    console.error("❌ Error createProduct:", err);
    res.status(500).json({ message: "Error del servidor" });

  } finally {
    conn.release();
  }
};

/* =====================================================
   LISTAR PRODUCTOS (SOLO LOS QUE TIENEN STOCK)
===================================================== */
exports.getAllProducts = async (_, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.producto_id,
        pb.nombre AS producto_base,
        v.nombre AS variante,
        p.imagen,
        pr.nombre AS presentacion,
        c.codigo AS ean14,
        SUM(inv.stock_cajas) AS stock_cajas
      FROM producto p
      JOIN producto_base pb ON pb.producto_base_id = p.producto_base_id
      JOIN variante v ON v.variante_id = p.variante_id
      JOIN producto_presentacion pp ON pp.producto_id = p.producto_id
      JOIN presentacion pr ON pr.presentacion_id = pp.presentacion_id
      JOIN producto_presentacion_codigo ppc 
        ON ppc.producto_presentacion_id = pp.producto_presentacion_id
      JOIN codigo c 
        ON c.codigo_id = ppc.codigo_id AND c.tipo_codigo = 'EAN14'
      JOIN batch b ON b.producto_presentacion_codigo_id = ppc.producto_presentacion_codigo_id
      JOIN inventario inv ON inv.batch_id = b.batch_id
      WHERE inv.stock_cajas > 0
      GROUP BY 
        p.producto_id, pb.nombre, v.nombre, p.imagen, 
        pr.nombre, c.codigo
      ORDER BY p.producto_id DESC;
    `);

    res.json(rows);
  } catch (err) {
    console.error("❌ getAllProducts:", err);
    res.status(500).json({ message: "Error obteniendo productos" });
  }
};


/* =====================================================
   DETALLE DE PRODUCTO (LOTE CON STOCK REAL)
===================================================== */
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const [prodRows] = await pool.query(`
      SELECT 
        p.producto_id,
        pb.nombre AS producto_base,
        v.nombre AS variante,
        p.imagen,
        pr.nombre AS presentacion,
        c.codigo AS ean14
      FROM producto p
      JOIN producto_base pb ON p.producto_base_id = pb.producto_base_id
      JOIN variante v ON p.variante_id = v.variante_id
      JOIN producto_presentacion pp ON p.producto_id = pp.producto_id
      JOIN presentacion pr ON pr.presentacion_id = pp.presentacion_id
      JOIN producto_presentacion_codigo ppc 
        ON ppc.producto_presentacion_id = pp.producto_presentacion_id
      JOIN codigo c ON c.codigo_id = ppc.codigo_id AND c.tipo_codigo = 'EAN14'
      WHERE p.producto_id = ?
      LIMIT 1
    `, [id]);

    if (!prodRows.length) 
      return res.status(404).json({ message: "Producto no encontrado" });

    // TODOS LOS LOTES DEL PRODUCTO
    const [lotes] = await pool.query(`
      SELECT 
        b.batch_id,
        b.codigo_lote,
        b.fecha_elaboracion,
        b.fecha_vencimiento,
        SUM(inv.stock_cajas) AS stock_cajas
      FROM batch b
      JOIN inventario inv ON inv.batch_id = b.batch_id
      JOIN producto_presentacion_codigo ppc 
        ON ppc.producto_presentacion_codigo_id = b.producto_presentacion_codigo_id
      JOIN producto_presentacion pp 
        ON pp.producto_presentacion_id = ppc.producto_presentacion_id
      WHERE pp.producto_id = ?
      GROUP BY b.batch_id
    `, [id]);

    return res.json({
      ...prodRows[0],
      lotes
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener producto" });
  }
};


/* =====================================================
   CREAR CÓDIGOS
===================================================== */
exports.createCodes = async (req, res) => {
  try {
    const { producto_presentacion_id, ean13, ean14, precio } = req.body;

    if (!producto_presentacion_id || !ean14)
      return res.status(400).json({ message: "Faltan datos" });

    // Crear EAN14
    const [eanRow] = await pool.query(
      "INSERT INTO codigo (tipo_codigo, codigo) VALUES ('EAN14', ?)",
      [ean14]
    );

    const codigo_14_id = eanRow.insertId;

    // Asociar a producto_presentación
    await pool.query(
      `INSERT INTO producto_presentacion_codigo 
       (producto_presentacion_id, codigo_id, nivel_empaque, precio)
       VALUES (?, ?, 'CAJA', ?)`,
      [producto_presentacion_id, codigo_14_id, precio]
    );

    res.json({ message: "Código creado correctamente" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creando código" });
  }
};

/* =====================================================
   CREAR BATCH
===================================================== */
exports.createBatch = async (req, res) => {
  try {
    const {
      producto_presentacion_codigo_id,
      codigo_lote,
      fecha_elaboracion,
      fecha_vencimiento
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO batch 
        (producto_presentacion_codigo_id, codigo_lote, fecha_elaboracion, fecha_vencimiento)
       VALUES (?, ?, ?, ?)`,
      [
        producto_presentacion_codigo_id,
        codigo_lote,
        fecha_elaboracion,
        fecha_vencimiento
      ]
    );

    res.json({ batch_id: result.insertId });

  } catch (err) {
    res.status(500).json({ message: "Error creando lote" });
  }
};


/* =====================================================
   DATA LISTS (TIPO / CATEGORIA / BASE / VARIANTE / PRESENTACION)
===================================================== */
exports.getTipos = async (_, res) => {
  const [rows] = await pool.query("SELECT * FROM tipo ORDER BY nombre ASC");
  res.json(rows);
};

exports.addTipo = async (req, res) => {
  const { nombre } = req.body;

  const [result] = await pool.query(
    "INSERT INTO tipo (nombre) VALUES (?)",
    [nombre]
  );

  res.json({ tipo_id: result.insertId, nombre });
};

exports.getCategorias = async (_, res) => {
  const [rows] = await pool.query("SELECT * FROM categoria ORDER BY nombre ASC");
  res.json(rows);
};

exports.addCategoria = async (req, res) => {
  const { nombre } = req.body;

  const [result] = await pool.query(
    "INSERT INTO categoria (nombre) VALUES (?)",
    [nombre]
  );

  res.json({ categoria_id: result.insertId, nombre });
};

exports.getProductoBase = async (_, res) => {
  const [rows] = await pool.query("SELECT * FROM producto_base ORDER BY nombre ASC");
  res.json(rows);
};

exports.addProductoBase = async (req, res) => {
  const { tipo_id, nombre } = req.body;

  const [result] = await pool.query(
    "INSERT INTO producto_base (nombre, tipo_id) VALUES (?, ?)",
    [nombre, tipo_id]
  );

  res.json({ producto_base_id: result.insertId, nombre });
};

exports.getVariantes = async (req, res) => {
  const { categoria_id } = req.params;

  const [rows] = await pool.query(
    "SELECT * FROM variante WHERE categoria_id = ? ORDER BY nombre ASC",
    [categoria_id]
  );

  res.json(rows);
};

exports.addVariante = async (req, res) => {
  const { categoria_id, nombre } = req.body;

  const [result] = await pool.query(
    "INSERT INTO variante (categoria_id, nombre) VALUES (?, ?)",
    [categoria_id, nombre]
  );

  res.json({ variante_id: result.insertId, nombre });
};

exports.getPresentaciones = async (_, res) => {
  const [rows] = await pool.query("SELECT * FROM presentacion ORDER BY nombre ASC");
  res.json(rows);
};

exports.addPresentacion = async (req, res) => {
  const { nombre } = req.body;

  const [result] = await pool.query(
    "INSERT INTO presentacion (nombre) VALUES (?)",
    [nombre]
  );

  res.json({ presentacion_id: result.insertId, nombre });
};
