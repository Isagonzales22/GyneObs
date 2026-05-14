const express = require("express");
const router = express.Router();

const {
  crearAntecedenteFamiliar,
  obtenerAntecedenteFamiliar,
  actualizarAntecedenteFamiliar,
  eliminarAntecedenteFamiliar,
} = require("../controllers/antecedenteFamiliar.controller");

const {
  verificarToken,
  permitirRoles,
} = require("../middlewares/authMiddleware");

router.post("/", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), crearAntecedenteFamiliar);

router.get("/:id", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), obtenerAntecedenteFamiliar);

router.put("/:id", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), actualizarAntecedenteFamiliar);

router.delete("/:id", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), eliminarAntecedenteFamiliar);

module.exports = router;