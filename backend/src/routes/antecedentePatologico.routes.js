const express = require("express");
const router = express.Router();

const {
  crearAntecedentePatologico,
  obtenerAntecedentePatologico,
  actualizarAntecedentePatologico,
  eliminarAntecedentePatologico,
} = require("../controllers/antecedentePatologico.controller");

const {
  verificarToken,
  permitirRoles,
} = require("../middlewares/authMiddleware");

router.post("/", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), crearAntecedentePatologico);

router.get("/:id", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), obtenerAntecedentePatologico);

router.put("/:id", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), actualizarAntecedentePatologico);

router.delete("/:id", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), eliminarAntecedentePatologico);

module.exports = router;