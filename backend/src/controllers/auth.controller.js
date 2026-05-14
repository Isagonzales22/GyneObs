const bcrypt = require("bcryptjs");
const { Usuario, Rol } = require("../../models");
const generarToken = require("../utils/generarToken");

const loginManual = async (req, res) => {
  try {
    const { correo_electronico, password } = req.body;

    const usuario = await Usuario.findOne({
      where: { correo_electronico },
      include: [{ model: Rol, as: "rol" }],
    });

    if (!usuario) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado",
      });
    }

    if (!usuario.password_hash) {
      return res.status(400).json({
        ok: false,
        message: "Este usuario debe iniciar sesión con Google",
      });
    }

    const passwordValido = await bcrypt.compare(password, usuario.password_hash);

    if (!passwordValido) {
      return res.status(401).json({
        ok: false,
        message: "Contraseña incorrecta",
      });
    }

    const token = generarToken(usuario);

    res.json({
      ok: true,
      message: "Inicio de sesión exitoso",
      token,
      usuario,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error en login",
      error: error.message,
    });
  }
};

module.exports = {
  loginManual,
};