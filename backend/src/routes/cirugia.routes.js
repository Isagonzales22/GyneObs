const express = require("express");
const router = express.Router();

const {
  crearCirugia,
  listarCirugias,
  obtenerCirugia,
  actualizarCirugia,
  cancelarCirugia,
  eliminarCirugia,
} = require("../controllers/cirugia.controller");

const {
  verificarToken,
  permitirRoles,
} = require("../middlewares/authMiddleware");

router.post("/", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), crearCirugia);

router.get("/", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), listarCirugias);

router.get("/:id", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), obtenerCirugia);

router.put("/:id", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), actualizarCirugia);

router.patch("/:id/cancelar", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), cancelarCirugia);

router.delete("/:id", verificarToken, permitirRoles("ADMINISTRADOR"), eliminarCirugia);

module.exports = router;