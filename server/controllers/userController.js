const pool = require("../models/db");
const bcrypt = require("bcrypt");

/* =============================
   CREAR USUARIO NORMAL
============================= */
module.exports.createUser = async (req, res) => {
  try {
    const { name, email, password, rol_id } = req.body;

    const [exists] = await pool.query(
      "SELECT user_id FROM usuario WHERE email = ?",
      [email]
    );

    if (exists.length > 0)
      return res.status(409).json({ message: "El email ya está registrado" });

    const hash = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO usuario (name, email, password, rol_id) VALUES (?, ?, ?, ?)",
      [name, email, hash, rol_id]
    );

    res.status(201).json({ message: "Usuario creado correctamente" });
  } catch (err) {
    console.error("❌ Error createUser:", err);
    res.status(500).json({ message: "Error del servidor" });
  }
};

/* =============================
   CREAR CLIENTE (usuario + cliente)
============================= */
module.exports.createClient = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      rut,
      razon_social,
      direccion,
      telefono,
    } = req.body;

    const [exists] = await pool.query(
      "SELECT user_id FROM usuario WHERE email = ?",
      [email]
    );

    if (exists.length > 0)
      return res.status(409).json({ message: "El email ya está registrado" });

    const hash = await bcrypt.hash(password, 10);

    const [resultUser] = await pool.query(
      "INSERT INTO usuario (name, email, password, rol_id) VALUES (?, ?, ?, 3)",
      [name, email, hash]
    );

    await pool.query(
      `INSERT INTO cliente (user_id, rut, razon_social, direccion, telefono)
       VALUES (?, ?, ?, ?, ?)`,
      [resultUser.insertId, rut, razon_social, direccion, telefono]
    );

    res.status(201).json({ message: "Cliente creado correctamente" });
  } catch (err) {
    console.error("❌ Error createClient:", err);
    res.status(500).json({ message: "Error al crear cliente" });
  }
};

/* =============================
   USUARIO POR ID
============================= */
module.exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      "SELECT user_id, name, email, rol_id FROM usuario WHERE user_id = ?",
      [id]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "Usuario no encontrado" });

    res.json(rows[0]);
  } catch (err) {
    console.error("❌ Error getUserById:", err);
    res.status(500).json({ message: "Error del servidor" });
  }
};

/* =============================
   TODOS LOS USUARIOS (excepto CLIENTES)
============================= */
module.exports.getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT user_id, name, email, rol_id 
      FROM usuario
      WHERE rol_id != 3 
      ORDER BY user_id DESC
    `);

    res.json({ users: rows });

  } catch (err) {
    console.error("❌ Error getAllUsers:", err);
    res.status(500).json({ message: "Error al consultar usuarios" });
  }
};

/* =============================
   CLIENTE POR ID
============================= */
module.exports.getClient = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT 
        u.user_id, u.name, u.email, u.rol_id,
        c.cliente_id, c.rut, c.razon_social, c.direccion, c.telefono
      FROM cliente c
      INNER JOIN usuario u ON u.user_id = c.user_id
      WHERE c.cliente_id = ?`,
      [id]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "Cliente no encontrado" });

    res.json(rows[0]);

  } catch (err) {
    console.error("❌ Error getClient:", err);
    res.status(500).json({ message: "Error al consultar cliente" });
  }
};

/* =============================
   TODOS LOS CLIENTES
============================= */
module.exports.getAllClients = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        u.user_id, u.name, u.email, u.rol_id,
        c.cliente_id, c.rut, c.razon_social, c.direccion, c.telefono
      FROM cliente c
      INNER JOIN usuario u ON u.user_id = c.user_id
      ORDER BY c.cliente_id DESC
    `);

    res.json({ clients: rows });

  } catch (err) {
    console.error("❌ Error getAllClients:", err);
    res.status(500).json({ message: "Error al consultar clientes" });
  }
};

/* =============================
   ACTUALIZAR USUARIO
============================= */
module.exports.updateUser = async (req, res) => {
  try {
    const { name, email, password, rol_id } = req.body;
    const { id } = req.params;

    let fields = [];
    let values = [];

    if (name) { fields.push("name = ?"); values.push(name); }
    if (email) { fields.push("email = ?"); values.push(email); }
    if (rol_id) { fields.push("rol_id = ?"); values.push(rol_id); }

    if (password) {
      const hash = await bcrypt.hash(password, 10);
      fields.push("password = ?");
      values.push(hash);
    }

    values.push(id);

    await pool.query(
      `UPDATE usuario SET ${fields.join(", ")} WHERE user_id = ?`,
      values
    );

    res.json({ message: "Usuario actualizado correctamente" });

  } catch (err) {
    console.error("❌ Error updateUser:", err);
    res.status(500).json({ message: "Error al actualizar usuario" });
  }
};

/* =============================
   ACTUALIZAR CLIENTE + USUARIO
============================= */
module.exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      password,
      rut,
      razon_social,
      direccion,
      telefono,
    } = req.body;

    // === Actualizar usuario ===
    let fields = [];
    let values = [];

    if (name) { fields.push("name = ?"); values.push(name); }
    if (email) { fields.push("email = ?"); values.push(email); }
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      fields.push("password = ?");
      values.push(hash);
    }

    if (fields.length > 0) {
      values.push(id);
      await pool.query(
        `UPDATE usuario SET ${fields.join(", ")} WHERE user_id = ?`,
        values
      );
    }

    // === Actualizar cliente ===
    let cFields = [];
    let cValues = [];

    if (rut) { cFields.push("rut = ?"); cValues.push(rut); }
    if (razon_social) { cFields.push("razon_social = ?"); cValues.push(razon_social); }
    if (direccion) { cFields.push("direccion = ?"); cValues.push(direccion); }
    if (telefono) { cFields.push("telefono = ?"); cValues.push(telefono); }

    cValues.push(id);

    await pool.query(
      `UPDATE cliente SET ${cFields.join(", ")} WHERE user_id = ?`,
      cValues
    );

    res.json({ message: "Cliente actualizado correctamente" });

  } catch (err) {
    console.error("❌ Error updateClient:", err);
    res.status(500).json({ message: "Error al actualizar cliente" });
  }
};

/* =============================
   ELIMINAR USUARIO
============================= */
module.exports.deleteUser = async (req, res) => {
  try {
    await pool.query("DELETE FROM usuario WHERE user_id = ?", [req.params.id]);

    res.json({ message: "Usuario eliminado correctamente" });
  } catch (err) {
    console.error("❌ Error deleteUser:", err);
    res.status(500).json({ message: "Error al eliminar usuario" });
  }
};

/* =============================
   ELIMINAR CLIENTE
============================= */
module.exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    const [[client]] = await pool.query(
      "SELECT user_id FROM cliente WHERE cliente_id = ?",
      [id]
    );

    if (!client)
      return res.status(404).json({ message: "Cliente no encontrado" });

    await pool.query("DELETE FROM cliente WHERE cliente_id = ?", [id]);
    await pool.query("DELETE FROM usuario WHERE user_id = ?", [client.user_id]);

    res.json({ message: "Cliente eliminado correctamente" });

  } catch (err) {
    console.error("❌ Error deleteClient:", err);
    res.status(500).json({ message: "Error al eliminar cliente" });
  }
};

/* =============================
   PERFIL
============================= */
module.exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.uid;

    const [[user]] = await pool.query(
      "SELECT user_id, name, email, rol_id FROM usuario WHERE user_id = ?",
      [userId]
    );

    res.json(user);

  } catch (err) {
    console.error("❌ Error getProfile:", err);
    res.status(500).json({ message: "Error de servidor" });
  }
};
