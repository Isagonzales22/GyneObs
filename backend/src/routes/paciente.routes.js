const express = require("express");
const router = express.Router();

const {
  listarPacientes,
  crearPaciente,
  obtenerPacientePorId,
  actualizarPaciente,
  eliminarPaciente,
} = require("../controllers/paciente.controller");

const {
  verificarToken,
  permitirRoles,
} = require("../middlewares/authMiddleware");

router.get(
  "/",
  verificarToken,
  permitirRoles("ADMINISTRADOR", "MEDICO", "SECRETARIA"),
  listarPacientes
);

router.post(
  "/",
  verificarToken,
  permitirRoles("ADMINISTRADOR", "SECRETARIA"),
  crearPaciente
);

router.get(
  "/:id",
  verificarToken,
  permitirRoles("ADMINISTRADOR", "MEDICO", "SECRETARIA"),
  obtenerPacientePorId
);

router.put(
  "/:id",
  verificarToken,
  permitirRoles("ADMINISTRADOR", "SECRETARIA"),
  actualizarPaciente
);

router.delete(
  "/:id",
  verificarToken,
  permitirRoles("ADMINISTRADOR"),
  eliminarPaciente
);

module.exports = router;