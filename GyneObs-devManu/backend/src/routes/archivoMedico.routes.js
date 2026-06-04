const express = require("express");
const router = express.Router();

const upload = require("../config/multer");

const {
  subirArchivo,
  listarArchivos,
} = require("../controllers/archivoMedico.controller");

const {
  verificarToken,
  permitirRoles,
} = require("../middlewares/authMiddleware");

router.post(
  "/",
  verificarToken,
  permitirRoles("ADMINISTRADOR", "MEDICO"),
  upload.single("archivo"),
  subirArchivo
);

router.get(
  "/",
  verificarToken,
  permitirRoles("ADMINISTRADOR", "MEDICO", "SECRETARIA"),
  listarArchivos
);

module.exports = router;