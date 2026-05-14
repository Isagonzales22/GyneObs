const express = require("express");
const router = express.Router();

const {
  crearDetalleReceta,
  obtenerDetalleReceta,
  actualizarDetalleReceta,
  eliminarDetalleReceta,
} = require("../controllers/detalleReceta.controller");

const {
  verificarToken,
  permitirRoles,
} = require("../middlewares/authMiddleware");

router.post("/", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), crearDetalleReceta);

router.get("/:id", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), obtenerDetalleReceta);

router.put("/:id", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), actualizarDetalleReceta);

router.delete("/:id", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), eliminarDetalleReceta);

module.exports = router;