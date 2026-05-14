const express = require("express");
const router = express.Router();

const {
  crearEmbarazoPrevio,
  obtenerEmbarazoPrevio,
  actualizarEmbarazoPrevio,
  eliminarEmbarazoPrevio,
} = require("../controllers/embarazoPrevio.controller");

const {
  verificarToken,
  permitirRoles,
} = require("../middlewares/authMiddleware");

router.post("/", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), crearEmbarazoPrevio);

router.get("/:id", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), obtenerEmbarazoPrevio);

router.put("/:id", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), actualizarEmbarazoPrevio);

router.delete("/:id", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), eliminarEmbarazoPrevio);

module.exports = router;