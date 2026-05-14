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

router.post("/", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO", "SECRETARIA"), crearCita);

router.get("/", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO", "SECRETARIA"), listarCitas);

router.get("/:id", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO", "SECRETARIA"), obtenerCita);

router.put("/:id", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO", "SECRETARIA"), actualizarCita);

router.patch("/:id/cancelar", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO", "SECRETARIA"), cancelarCita);

router.delete("/:id", verificarToken, permitirRoles("ADMINISTRADOR"), eliminarCita);

module.exports = router;