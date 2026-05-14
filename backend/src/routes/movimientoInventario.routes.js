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

router.post("/", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO", "SECRETARIA"), crearMovimiento);

router.get("/", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO", "SECRETARIA"), listarMovimientos);

router.get("/:id", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO", "SECRETARIA"), obtenerMovimiento);

module.exports = router;