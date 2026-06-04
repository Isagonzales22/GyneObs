const express = require("express");
const router = express.Router();

const {
  crearCita,
  listarCitas,
  obtenerCita,
  actualizarCita,
  cancelarCita,
  eliminarCita,
} = require("../controllers/cita.controller");

const {
  verificarToken,
  permitirRoles,
} = require("../middlewares/authMiddleware");

router.post("/", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), crearCita);

router.get("/", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO", "PACIENTE"), listarCitas);

router.get("/:id", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO", "PACIENTE"), obtenerCita);

router.put("/:id", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), actualizarCita);

router.patch("/:id/cancelar", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), cancelarCita);

router.delete("/:id", verificarToken, permitirRoles("ADMINISTRADOR"), eliminarCita);

module.exports = router;