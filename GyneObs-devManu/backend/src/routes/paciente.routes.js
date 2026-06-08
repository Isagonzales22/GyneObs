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
  permitirRoles("ADMINISTRADOR", "MEDICO", "PACIENTE"),
  listarPacientes
);

router.post(
  "/",
  verificarToken,
  permitirRoles("ADMINISTRADOR", "MEDICO"),
  crearPaciente
);

router.get(
  "/:id",
  verificarToken,
  permitirRoles("ADMINISTRADOR", "MEDICO", "PACIENTE"),
  obtenerPacientePorId
);

router.put(
  "/:id",
  verificarToken,
  permitirRoles("ADMINISTRADOR", "MEDICO"),
  actualizarPaciente
);

router.delete(
  "/:id",
  verificarToken,
  permitirRoles("ADMINISTRADOR", "MEDICO"),
  eliminarPaciente
);

module.exports = router;