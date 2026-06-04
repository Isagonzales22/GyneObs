const express = require("express");
const router = express.Router();

const {
  crearDiagnostico,
  obtenerDiagnostico,
  actualizarDiagnostico,
  eliminarDiagnostico,
} = require("../controllers/diagnostico.controller");

const {
  verificarToken,
  permitirRoles,
} = require("../middlewares/authMiddleware");

router.post("/", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), crearDiagnostico);

router.get("/:id", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), obtenerDiagnostico);

router.put("/:id", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), actualizarDiagnostico);

router.delete("/:id", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), eliminarDiagnostico);

module.exports = router;