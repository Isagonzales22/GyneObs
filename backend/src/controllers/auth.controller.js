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
    // Accept both frontend and backend field names
    const primer_nombre = req.body.primer_nombre || req.body.nombre;
    const segundo_nombre = req.body.segundo_nombre || req.body.segundoNombre || null;
    const primer_apellido = req.body.primer_apellido || req.body.apellido;
    const segundo_apellido = req.body.segundo_apellido || req.body.segundoApellido || null;
    const correo_electronico = req.body.correo_electronico || req.body.correoElectronico;
    const passwordRaw = req.body.password || req.body.contrasena || req.body.password_raw;
    const id_rol_body = req.body.id_rol || req.body.roleId || null;
    const rol_nombre_body = req.body.rol || req.body.nombre_rol || null;

    // correo_electronico is required
    if (!correo_electronico) {
      return res.status(400).json({ ok: false, message: "El correo electrónico es obligatorio" });
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.findOne({ where: { correo_electronico } });
    if (usuarioExistente) {
      return res.status(400).json({
        ok: false,
        message: "El correo electrónico ya está registrado",
      });
    }

    // Determinar id_rol
    let id_rol = null;
    if (id_rol_body) {
      id_rol = id_rol_body;
    } else if (rol_nombre_body) {
      const rolEncontrado = await Rol.findOne({ where: { nombre_rol: rol_nombre_body } });
      if (!rolEncontrado) {
        return res.status(400).json({ ok: false, message: "Rol no válido" });
      }
      id_rol = rolEncontrado.id_rol;
    } else {
      // Default to PACIENTE if not provided
      const rolPaciente = await Rol.findOne({ where: { nombre_rol: "PACIENTE" } });
      id_rol = rolPaciente ? rolPaciente.id_rol : 3;
    }

    // Password is required for manual registrations
    if (!passwordRaw) {
      return res.status(400).json({ ok: false, message: "La contraseña es obligatoria" });
    }

    const passwordHash = await bcrypt.hash(passwordRaw, 10);

    const nuevoUsuario = await Usuario.create({
      id_rol,
      correo_electronico,
      password_hash: passwordHash,
      primer_nombre: primer_nombre,
      segundo_nombre,
      primer_apellido: primer_apellido,
      segundo_apellido,
      ci: req.body.ci || null,
      complemento_ci: req.body.complemento_ci || req.body.complementoCi || null,
      telefono: req.body.telefono || null,
      fecha_nacimiento: req.body.fecha_nacimiento || req.body.fechaNacimiento || null,
      sexo: req.body.sexo || null,
      direccion: req.body.direccion || null,
      foto_perfil_url: req.body.foto_perfil_url || req.body.fotoPerfilUrl || null,
      estado: true,
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