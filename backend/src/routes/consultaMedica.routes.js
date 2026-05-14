const express = require("express");
const router = express.Router();

const {
  crearConsultaMedica,
  listarConsultasMedicas,
  obtenerConsultaMedica,
  actualizarConsultaMedica,
  eliminarConsultaMedica,
} = require("../controllers/consultaMedica.controller");

const {
  verificarToken,
  permitirRoles,
} = require("../middlewares/authMiddleware");

router.post("/", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), crearConsultaMedica);

router.get("/", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO", "SECRETARIA"), listarConsultasMedicas);

router.get("/:id", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO", "SECRETARIA"), obtenerConsultaMedica);

router.put("/:id", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), actualizarConsultaMedica);

router.delete("/:id", verificarToken, permitirRoles("ADMINISTRADOR"), eliminarConsultaMedica);

module.exports = router;