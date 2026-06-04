const express = require("express");
const router = express.Router();

const {
  listarUsuarios,
  crearUsuario,
  obtenerUsuarioPorId,
  actualizarUsuario,
  eliminarUsuario,
} = require("../controllers/usuario.controller");

const {
  verificarToken,
  permitirRoles,
} = require("../middlewares/authMiddleware");

router.get("/", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), listarUsuarios);

router.post("/", verificarToken, permitirRoles("ADMINISTRADOR"), crearUsuario);

router.get("/:id", verificarToken, permitirRoles("ADMINISTRADOR", "MEDICO"), obtenerUsuarioPorId);

// Cualquier usuario autenticado puede actualizar su propio perfil; staff actualiza a otros
router.put("/:id", verificarToken, actualizarUsuario);

router.delete("/:id", verificarToken, permitirRoles("ADMINISTRADOR"), eliminarUsuario);

module.exports = router;