const express = require("express");
const router = express.Router();

const {
  crearConsultaMedica,
  listarConsultasMedicas,
  obtenerConsultaMedica,
  obtenerConsultasPorHistoria,
  actualizarConsultaMedica,
  eliminarConsultaMedica,
} = require("../controllers/consultaMedica.controller");

const {
  verificarToken,
  permitirRoles,
} = require("../middlewares/authMiddleware");

router.post("/", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), crearConsultaMedica);

router.get("/", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), listarConsultasMedicas);

router.get("/historia/:historiaId", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), obtenerConsultasPorHistoria);

router.get("/:id", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), obtenerConsultaMedica);

router.put("/:id", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), actualizarConsultaMedica);

router.delete("/:id", verificarToken, permitirRoles("ADMINISTRADOR"), eliminarConsultaMedica);

module.exports = router;