const express = require("express");
const router = express.Router();

const {
  crearExamenFisico,
  obtenerExamenFisico,
  actualizarExamenFisico,
  eliminarExamenFisico,
} = require("../controllers/examenFisico.controller");

const {
  verificarToken,
  permitirRoles,
} = require("../middlewares/authMiddleware");

router.post("/", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), crearExamenFisico);

router.get("/:id", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), obtenerExamenFisico);

router.put("/:id", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), actualizarExamenFisico);

router.delete("/:id", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), eliminarExamenFisico);

module.exports = router;