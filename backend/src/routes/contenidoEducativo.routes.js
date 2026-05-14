const express = require("express");
const router = express.Router();

const {
  crearContenido,
  listarContenidos,
  obtenerContenido,
  actualizarContenido,
  eliminarContenido,
} = require("../controllers/contenidoEducativo.controller");

const {
  verificarToken,
  permitirRoles,
} = require("../middlewares/authMiddleware");

router.post("/", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), crearContenido);

router.get("/", verificarToken, listarContenidos);

router.get("/:id", verificarToken, obtenerContenido);

router.put("/:id", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), actualizarContenido);

router.delete("/:id", verificarToken, permitirRoles("ADMINISTRADOR"), eliminarContenido);

module.exports = router;
