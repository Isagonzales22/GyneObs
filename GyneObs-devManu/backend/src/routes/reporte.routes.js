const express = require("express");
const router = express.Router();

const {
  resumenGeneral,
  reportePacientes,
  reporteCitas,
  reporteCirugias,
  reporteInventario,
  reporteMovimientosInventario,
  reporteHistoriaClinica,
  reporteHistoriaClinicaPDF,
  reporteInventarioPDF,
  reporteCitasPDF,
} = require("../controllers/reporte.controller");



const {
  verificarToken,
  permitirRoles,
} = require("../middlewares/authMiddleware");

router.get(
  "/resumen",
  verificarToken,
  permitirRoles("ADMINISTRADOR", "MEDICO", "SECRETARIA"),
  resumenGeneral
);

router.get(
  "/inventario",
  verificarToken,
  permitirRoles("ADMINISTRADOR", "MEDICO", "SECRETARIA"),
  reporteInventario
);

router.get(
  "/movimientos-inventario",
  verificarToken,
  permitirRoles("ADMINISTRADOR", "SECRETARIA"),
  reporteMovimientosInventario
);
router.get(
  "/pacientes",
  verificarToken,
  permitirRoles("ADMINISTRADOR", "MEDICO", "SECRETARIA"),
  reportePacientes
);

router.get(
  "/citas",
  verificarToken,
  permitirRoles("ADMINISTRADOR", "MEDICO", "SECRETARIA"),
  reporteCitas
);
router.get(
  "/cirugias",
  verificarToken,
  permitirRoles("ADMINISTRADOR", "MEDICO", "SECRETARIA"),
  reporteCirugias
);
router.get(
  "/historia-clinica/:idPaciente",
  verificarToken,
  permitirRoles("ADMINISTRADOR", "MEDICO", "SECRETARIA"),
  reporteHistoriaClinica
);
router.get(
  "/historia-clinica/:idPaciente/pdf",
  verificarToken,
  permitirRoles("ADMINISTRADOR", "MEDICO", "SECRETARIA"),
  reporteHistoriaClinicaPDF
);
router.get(
  "/inventario/pdf",
  verificarToken,
  permitirRoles("ADMINISTRADOR", "MEDICO", "SECRETARIA"),
  reporteInventarioPDF
);
router.get(
  "/citas/pdf",
  verificarToken,
  permitirRoles("ADMINISTRADOR", "MEDICO", "SECRETARIA"),
  reporteCitasPDF
);

module.exports = router;