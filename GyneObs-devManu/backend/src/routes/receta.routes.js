const express = require("express");
const router = express.Router();

const {
  listarRecetas,
  crearRecetaCompleta,
  crearReceta,
  obtenerReceta,
  obtenerRecetaPorConsulta,
  actualizarReceta,
  eliminarReceta,
} = require("../controllers/receta.controller");

const {
  verificarToken,
  permitirRoles,
} = require("../middlewares/authMiddleware");

router.get(
  "/",
  verificarToken,
  permitirRoles("ADMINISTRADOR", "MEDICO", "PACIENTE"),
  listarRecetas
);

router.post(
  "/completa",
  verificarToken,
  permitirRoles("ADMINISTRADOR", "MEDICO"),
  crearRecetaCompleta
);

router.post("/", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), crearReceta);

router.get(
  "/consulta/:consultaId",
  verificarToken,
  permitirRoles("ADMINISTRADOR", "MEDICO", "PACIENTE"),
  obtenerRecetaPorConsulta
);

router.get(
  "/:id",
  verificarToken,
  permitirRoles("ADMINISTRADOR", "MEDICO", "PACIENTE"),
  obtenerReceta
);

router.put("/:id", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), actualizarReceta);

router.delete("/:id", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), eliminarReceta);

module.exports = router;
