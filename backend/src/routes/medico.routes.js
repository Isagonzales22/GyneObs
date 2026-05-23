const express = require("express");
const router = express.Router();
const { listarMedicos, obtenerMedicoLogueado } = require("../controllers/medico.controller");
const { verificarToken, permitirRoles } = require("../middlewares/authMiddleware");

router.get("/yo", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), obtenerMedicoLogueado);

router.get("/", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), listarMedicos);

module.exports = router;