const express = require("express");
const router = express.Router();

const {
  listarHistoriasClinicas,
  crearHistoriaClinica,
  obtenerHistoriaPorId,
  actualizarHistoriaClinica,
  eliminarHistoriaClinica,
} = require("../controllers/historiaClinica.controller");

const {
  verificarToken,
  permitirRoles,
} = require("../middlewares/authMiddleware");

router.get(
  "/",
  verificarToken,
  permitirRoles("ADMINISTRADOR", "MEDICO"),
  listarHistoriasClinicas
);

router.post(
  "/",
  verificarToken,
  permitirRoles("ADMINISTRADOR", "MEDICO"),
  crearHistoriaClinica
);

router.get(
  "/:id",
  verificarToken,
  permitirRoles("ADMINISTRADOR", "MEDICO"),
  obtenerHistoriaPorId
);

router.put(
  "/:id",
  verificarToken,
  permitirRoles("ADMINISTRADOR", "MEDICO"),
  actualizarHistoriaClinica
);

router.delete(
  "/:id",
  verificarToken,
  permitirRoles("ADMINISTRADOR"),
  eliminarHistoriaClinica
);

module.exports = router;