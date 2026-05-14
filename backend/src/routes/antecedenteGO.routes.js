const express = require("express");
const router = express.Router();

const {
  crearAntecedenteGO,
  obtenerAntecedenteGO,
  actualizarAntecedenteGO,
} = require("../controllers/antecedenteGO.controller");

const {
  verificarToken,
  permitirRoles,
} = require("../middlewares/authMiddleware");

router.post(
  "/",
  verificarToken,
  permitirRoles("ADMINISTRADOR", "MEDICO"),
  crearAntecedenteGO
);

router.get(
  "/:id",
  verificarToken,
  permitirRoles("ADMINISTRADOR", "MEDICO"),
  obtenerAntecedenteGO
);

router.put(
  "/:id",
  verificarToken,
  permitirRoles("ADMINISTRADOR", "MEDICO"),
  actualizarAntecedenteGO
);

module.exports = router;