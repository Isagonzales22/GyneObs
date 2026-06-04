const express = require("express");
const router = express.Router();

const {
  crearAntecedenteNoPatologico,
  obtenerAntecedenteNoPatologico,
  actualizarAntecedenteNoPatologico,
  eliminarAntecedenteNoPatologico,
} = require("../controllers/antecedenteNoPatologico.controller");

const {
  verificarToken,
  permitirRoles,
} = require("../middlewares/authMiddleware");

router.post("/", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), crearAntecedenteNoPatologico);

router.get("/:id", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), obtenerAntecedenteNoPatologico);

router.put("/:id", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), actualizarAntecedenteNoPatologico);

router.delete("/:id", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), eliminarAntecedenteNoPatologico);

module.exports = router;
