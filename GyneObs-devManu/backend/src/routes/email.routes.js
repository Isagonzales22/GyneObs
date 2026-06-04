const express = require("express");
const router = express.Router();

const {
  enviarCorreoPrueba,
} = require("../controllers/email.controller");

const {
  verificarToken,
  permitirRoles,
} = require("../middlewares/authMiddleware");

router.post(
  "/prueba",
  verificarToken,
  permitirRoles("ADMINISTRADOR"),
  enviarCorreoPrueba
);

module.exports = router;