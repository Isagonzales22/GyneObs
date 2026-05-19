const express = require("express");
const router = express.Router();

const {
  crearInsumo,
  listarInsumos,
  obtenerInsumo,
  actualizarInsumo,
  eliminarInsumo,
} = require("../controllers/insumoMedico.controller");

const {
  verificarToken,
  permitirRoles,
} = require("../middlewares/authMiddleware");

router.post("/", verificarToken, permitirRoles("ADMINISTRADOR"), crearInsumo);

router.get("/", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), listarInsumos);

router.get("/:id", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), obtenerInsumo);

router.put("/:id", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), actualizarInsumo);

router.delete("/:id", verificarToken, permitirRoles("ADMINISTRADOR"), eliminarInsumo);

module.exports = router;