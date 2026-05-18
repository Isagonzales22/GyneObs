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

const register = async (req, res) => {
  try {
    const { nombre, apellido, correoElectronico, contrasena, rol } = req.body;

    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.findOne({ where: { correo_electronico: correoElectronico } });
    if (usuarioExistente) {
      return res.status(400).json({
        ok: false,
        message: "El correo electrónico ya está registrado",
      });
    }

    // Mapear rol de texto a ID
    const rolEncontrado = await Rol.findOne({ where: { nombre_rol: rol } });
    if (!rolEncontrado) {
      return res.status(400).json({
        ok: false,
        message: "Rol no válido",
      });
    }

    const passwordHash = await bcrypt.hash(contrasena, 10);

    const nuevoUsuario = await Usuario.create({
      id_rol: rolEncontrado.id_rol,
      correo_electronico: correoElectronico,
      password_hash: passwordHash,
      primer_nombre: nombre,
      primer_apellido: apellido,
      estado: true
    });

    const token = generarToken(nuevoUsuario);

    res.status(201).json({
      ok: true,
      message: "Usuario registrado exitosamente",
      token,
      usuario: nuevoUsuario,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al registrar usuario",
      error: error.message,
    });
  }
};

module.exports = {
  loginManual,
  register,
};