const express = require('express');
require('dotenv').config();
const cookieParser = require("cookie-parser");
const routes = require('./routes/authRoute');
const path = require("path");
const cors = require('cors');
const app = express();
const port = process.env.PORT;

app.use(cors({
  origin: ["http://localhost:5173"],
  methods: ["GET", "POST"],
  credentials: true // <- necesario para cookies HttpOnly
}));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// TODO: montar todas las rutas bajo /api
app.use('/api', routes); // <-- cambio aquí

// 404
app.use((req, res) => {
  console.log("404");
  res.status(404).send("404 - Not Found");
});

app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
