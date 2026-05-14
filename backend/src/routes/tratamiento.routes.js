const express = require("express");
const router = express.Router();

const {
  crearTratamiento,
  obtenerTratamiento,
  actualizarTratamiento,
  eliminarTratamiento,
} = require("../controllers/tratamiento.controller");

const {
  verificarToken,
  permitirRoles,
} = require("../middlewares/authMiddleware");

router.post("/", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), crearTratamiento);

router.get("/:id", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), obtenerTratamiento);

router.put("/:id", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), actualizarTratamiento);

router.delete("/:id", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), eliminarTratamiento);

module.exports = router;