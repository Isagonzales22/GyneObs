const express = require("express");
const router = express.Router();

const {
  crearExamenGinecologico,
  obtenerExamenGinecologico,
  actualizarExamenGinecologico,
  eliminarExamenGinecologico,
} = require("../controllers/examenGinecologico.controller");

const {
  verificarToken,
  permitirRoles,
} = require("../middlewares/authMiddleware");

router.post("/", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), crearExamenGinecologico);

router.get("/:id", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), obtenerExamenGinecologico);

router.put("/:id", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), actualizarExamenGinecologico);

router.delete("/:id", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), eliminarExamenGinecologico);

module.exports = router;