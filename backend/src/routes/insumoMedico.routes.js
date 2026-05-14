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

router.post("/", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO", "SECRETARIA"), crearInsumo);

router.get("/", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO", "SECRETARIA"), listarInsumos);

router.get("/:id", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO", "SECRETARIA"), obtenerInsumo);

router.put("/:id", verificarToken, permitirRoles("ADMINISTRADOR", "SECRETARIA"), actualizarInsumo);

router.delete("/:id", verificarToken, permitirRoles("ADMINISTRADOR"), eliminarInsumo);

module.exports = router;