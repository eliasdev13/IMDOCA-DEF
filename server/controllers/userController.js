const pool = require("../models/db");
const bcrypt = require("bcrypt");

// =====================
// CREAR USUARIO NORMAL
// =====================


module.exports.createUser = async (req, res) => {
  try {
    const { name, email, password, rol_id } = req.body;

    // Verifica si ya existe el email
    const [exists] = await pool.query("SELECT * FROM usuario WHERE email = ?", [email]);
    if (exists.length > 0) {
      return res.status(409).json({ message: "El email ya está registrado" });
    }

    // Hashea la contraseña
    const hash = await bcrypt.hash(password, 10);

    // Inserta usando la columna correcta: 'nombre'
    await pool.query(
      "INSERT INTO usuario (name, email, password, rol_id) VALUES (?, ?, ?, ?)",
      [name, email, hash, rol_id]
    );

    res.status(201).json({ message: "Usuario creado correctamente" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error del servidor", error: err });
  }
};

// =====================
// CREAR CLIENTE
// =====================
module.exports.createClient = async (req, res) => {
  try {
    const { name, email, password, rut, razon_social, direccion, telefono } = req.body;

    const [exists] = await pool.query("SELECT * FROM usuario WHERE email = ?", [email]);
    if (exists.length > 0) return res.status(409).json({ message: "El email ya está registrado" });

    const hash = await bcrypt.hash(password, 10);

    // Crear usuario (rol 3 = cliente)
    const [resultUser] = await pool.query(
      "INSERT INTO usuario (name, email, password, rol_id) VALUES (?, ?, ?, 3)",
      [name, email, hash]
    );

    const userId = resultUser.insertId;

    // Crear datos cliente
    const [resultCliente] = await pool.query(
      `INSERT INTO cliente (user_id, rut, razon_social, direccion, telefono)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, rut, razon_social, direccion, telefono]
    );

    res.status(201).json({
      message: "Cliente creado correctamente",
      userId,
      clienteId: resultCliente.insertId
    });

  } catch (err) {
    res.status(500).json({ message: "Error al crear cliente", error: err });
  }
};

// ========================
// OBTENER USUARIO POR ID
// ========================
module.exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      "SELECT user_id, name, email, rol_id FROM usuario WHERE user_id = ?",
      [id]
    );

    if (rows.length === 0) return res.status(404).json({ message: "Usuario no encontrado" });

    res.json(rows[0]);

  } catch (err) {
    res.status(500).json({ message: "Error del servidor", error: err });
  }
};

// ========================
// TODOS LOS USUARIOS
// ========================
module.exports.getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT user_id, name, email, rol_id FROM usuario");
    res.json({ users: rows });
  } catch (err) {
    res.status(500).json({ message: "Error al consultar usuarios", error: err });
  }
};

// ========================
// OBTENER CLIENTE POR ID
// ========================
module.exports.getClient = async (req, res) => {
  try {
    const { id } = req.params; // aquí recibes el cliente_id

    const [rows] = await pool.query(`
      SELECT 
          u.user_id, u.name, u.email, u.rol_id,
          c.cliente_id, c.rut, c.razon_social, c.direccion, c.telefono
      FROM cliente c
      INNER JOIN usuario u ON u.user_id = c.user_id
      WHERE c.cliente_id = ?
    `, [id]); // <-- ahora el WHERE usa cliente_id

    if (rows.length === 0) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    res.json(rows[0]);

  } catch (err) {
    res.status(500).json({ message: "Error al consultar cliente", error: err });
  }
};


// ========================
// TODOS LOS CLIENTES
// ========================
module.exports.getAllClients = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.user_id, u.name, u.email, u.rol_id,
             c.cliente_id, c.rut, c.razon_social, c.direccion, c.telefono
      FROM usuario u
      INNER JOIN cliente c ON u.user_id = c.user_id
    `);

    res.json({ clients: rows });

  } catch (err) {
    res.status(500).json({ message: "Error al consultar clientes", error: err });
  }
};


// ========================
// PERFIL DEL USUARIO LOGEADO
// ========================
module.exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.uid; // viene del JWT

    const [rows] = await pool.query(
      "SELECT user_id, name, email, rol_id FROM usuario WHERE user_id = ?",
      [userId]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "Usuario no encontrado" });

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error del servidor", error: err });
  }
};



// ========================
// ACTUALIZAR USUARIO
// ========================
module.exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, rol_id } = req.body;

    const fields = [];
    const values = [];

    if (name) { fields.push("name = ?"); values.push(name); }
    if (email) { fields.push("email = ?"); values.push(email); }
    if (rol_id) { fields.push("rol_id = ?"); values.push(rol_id); }
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      fields.push("password = ?"); values.push(hash);
    }

    if (fields.length === 0) return res.status(400).json({ message: "No hay datos para actualizar" });

    values.push(id);

    await pool.query(`UPDATE usuario SET ${fields.join(", ")} WHERE user_id = ?`, values);

    res.json({ message: "Usuario actualizado correctamente" });

  } catch (err) {
    res.status(500).json({ message: "Error al actualizar usuario", error: err });
  }
};

// ========================
// ACTUALIZAR CLIENTE
// ========================
module.exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, rut, razon_social, direccion, telefono } = req.body;

    // 1️⃣ Actualizar tabla usuario
    const userFields = [];
    const userValues = [];

    if (name) { userFields.push("name = ?"); userValues.push(name); }
    if (email) { userFields.push("email = ?"); userValues.push(email); }
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      userFields.push("password = ?"); userValues.push(hash);
    }

    if (userFields.length > 0) {
      userValues.push(id);
      await pool.query(`UPDATE usuario SET ${userFields.join(", ")} WHERE user_id = ?`, userValues);
    }

    // 2️⃣ Actualizar tabla cliente
    const clientFields = [];
    const clientValues = [];

    if (rut) { clientFields.push("rut = ?"); clientValues.push(rut); }
    if (razon_social) { clientFields.push("razon_social = ?"); clientValues.push(razon_social); }
    if (direccion) { clientFields.push("direccion = ?"); clientValues.push(direccion); }
    if (telefono) { clientFields.push("telefono = ?"); clientValues.push(telefono); }

    if (clientFields.length > 0) {
      clientValues.push(id);
      await pool.query(`UPDATE cliente SET ${clientFields.join(", ")} WHERE user_id = ?`, clientValues);
    }

    res.json({ message: "Cliente actualizado correctamente" });

  } catch (err) {
    res.status(500).json({ message: "Error al actualizar cliente", error: err });
  }
};
