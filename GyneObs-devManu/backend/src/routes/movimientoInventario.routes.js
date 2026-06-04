const express = require("express");
const router = express.Router();

const {
  crearMovimiento,
  listarMovimientos,
  obtenerMovimiento,
} = require("../controllers/movimientoInventario.controller");

const {
  verificarToken,
  permitirRoles,
} = require("../middlewares/authMiddleware");

router.post("/", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), crearMovimiento);

router.get("/", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), listarMovimientos);

router.get("/:id", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), obtenerMovimiento);

module.exports = router;