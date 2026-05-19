const express = require("express");
const router = express.Router();
const { listarMedicos } = require("../controllers/medico.controller");
const { verificarToken, permitirRoles } = require("../middlewares/authMiddleware");

router.get("/", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), listarMedicos);

module.exports = router;