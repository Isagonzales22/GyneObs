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

router.get("/", verificarToken, permitirRoles("ADMINISTRADOR"), listarUsuarios);

router.post("/", verificarToken, permitirRoles("ADMINISTRADOR"), crearUsuario);

router.get("/:id", verificarToken, permitirRoles("ADMINISTRADOR"), obtenerUsuarioPorId);

router.put("/:id", verificarToken, permitirRoles("ADMINISTRADOR"), actualizarUsuario);

router.delete("/:id", verificarToken, permitirRoles("ADMINISTRADOR"), eliminarUsuario);

module.exports = router;