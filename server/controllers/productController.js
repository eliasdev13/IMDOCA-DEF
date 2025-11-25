const pool = require('../models/db');

// Crear producto completo (producto_base + variante + producto + presentación)
exports.createProduct = async (req, res) => {
  try {
    const { nombre_base, tipo_id, variante_nombre, categoria_id, presentacion_id, imagen } = req.body;

    // 1️⃣ Producto base
    let [baseRows] = await pool.query(
      'SELECT producto_base_id FROM producto_base WHERE nombre = ? AND tipo_id = ?',
      [nombre_base, tipo_id]
    );
    let producto_base_id = baseRows.length ? baseRows[0].producto_base_id : (await pool.query(
      'INSERT INTO producto_base (nombre, tipo_id) VALUES (?, ?)',
      [nombre_base, tipo_id]
    ))[0].insertId;

    // 2️⃣ Variante
    let [varRows] = await pool.query(
      'SELECT variante_id FROM variante WHERE nombre = ? AND categoria_id = ?',
      [variante_nombre, categoria_id]
    );
    let variante_id = varRows.length ? varRows[0].variante_id : (await pool.query(
      'INSERT INTO variante (nombre, categoria_id) VALUES (?, ?)',
      [variante_nombre, categoria_id]
    ))[0].insertId;

    // 3️⃣ Producto final
    let [prodRows] = await pool.query(
      'SELECT producto_id FROM producto WHERE producto_base_id = ? AND variante_id = ?',
      [producto_base_id, variante_id]
    );
    let producto_id = prodRows.length ? prodRows[0].producto_id : (await pool.query(
      'INSERT INTO producto (producto_base_id, variante_id, imagen) VALUES (?, ?, ?)',
      [producto_base_id, variante_id, imagen]
    ))[0].insertId;

    // 4️⃣ Producto presentación
    let [ppRows] = await pool.query(
      'SELECT producto_presentacion_id FROM producto_presentacion WHERE producto_id = ? AND presentacion_id = ?',
      [producto_id, presentacion_id]
    );
    let producto_presentacion_id = ppRows.length ? ppRows[0].producto_presentacion_id : (await pool.query(
      'INSERT INTO producto_presentacion (producto_id, presentacion_id) VALUES (?, ?)',
      [producto_id, presentacion_id]
    ))[0].insertId;

    res.status(201).json({ message: 'Producto creado correctamente', producto_presentacion_id });
  } catch (err) {
    res.status(500).json({ message: 'Error al crear producto', error: err });
  }
};

// GET /products (solo cajas con EAN14)
exports.getAllProducts = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.producto_id,
        pb.nombre AS producto_base,
        v.nombre AS variante,
        p.imagen,
        pr.nombre AS presentacion,
        c.codigo AS ean14
      FROM producto p
      INNER JOIN producto_base pb ON p.producto_base_id = pb.producto_base_id
      INNER JOIN variante v ON p.variante_id = v.variante_id
      INNER JOIN producto_presentacion pp ON p.producto_id = pp.producto_id
      INNER JOIN presentacion pr ON pp.presentacion_id = pr.presentacion_id
      INNER JOIN producto_presentacion_codigo ppc ON pp.producto_presentacion_id = ppc.producto_presentacion_id
      INNER JOIN codigo c ON ppc.codigo_id = c.codigo_id
      WHERE c.tipo_codigo = 'EAN14';  -- SOLO CAJAS
    `);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener productos" });
  }
};

// GET /products/:id
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(`
      SELECT 
        p.producto_id,
        pb.nombre AS producto_base,
        v.nombre AS variante,
        p.imagen,
        pr.nombre AS presentacion,
        c.codigo AS ean14
      FROM producto p
      INNER JOIN producto_base pb ON p.producto_base_id = pb.producto_base_id
      INNER JOIN variante v ON p.variante_id = v.variante_id
      INNER JOIN producto_presentacion pp ON p.producto_id = pp.producto_id
      INNER JOIN presentacion pr ON pp.presentacion_id = pr.presentacion_id
      INNER JOIN producto_presentacion_codigo ppc ON pp.producto_presentacion_id = ppc.producto_presentacion_id
      INNER JOIN codigo c ON ppc.codigo_id = c.codigo_id
      WHERE c.tipo_codigo = 'EAN14'
        AND p.producto_id = ?;
    `, [id]);

    if (!rows.length) return res.status(404).json({ message: "Producto no encontrado" });

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener producto" });
  }
};
