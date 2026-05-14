const bcrypt = require("bcryptjs");
const { Usuario, Rol } = require("../../models");

const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      include: [{ model: Rol, as: "rol" }],
      order: [["created_at", "DESC"]],
    });

    res.json({
      ok: true,
      usuarios,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al listar usuarios",
      error: error.message,
    });
  }
};

const crearUsuario = async (req, res) => {
  try {
    const {
      id_rol,
      correo_electronico,
      password,
      primer_nombre,
      segundo_nombre,
      primer_apellido,
      segundo_apellido,
      ci,
      complemento_ci,
      telefono,
      fecha_nacimiento,
      sexo,
      direccion,
    } = req.body;

    const existeUsuario = await Usuario.findOne({
      where: { correo_electronico },
    });

    if (existeUsuario) {
      return res.status(400).json({
        ok: false,
        message: "El correo ya está registrado",
      });
    }

    const password_hash = password
      ? await bcrypt.hash(password, 10)
      : null;

    const usuario = await Usuario.create({
      id_rol,
      correo_electronico,
      password_hash,
      primer_nombre,
      segundo_nombre,
      primer_apellido,
      segundo_apellido,
      ci,
      complemento_ci,
      telefono,
      fecha_nacimiento,
      sexo,
      direccion,
    });

    res.status(201).json({
      ok: true,
      message: "Usuario creado correctamente",
      usuario,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al crear usuario",
      error: error.message,
    });
  }
};

const obtenerUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findByPk(id, {
      include: [{ model: Rol, as: "rol" }],
    });

    if (!usuario) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado",
      });
    }

    res.json({
      ok: true,
      usuario,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener usuario",
      error: error.message,
    });
  }
};

const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado",
      });
    }

    await usuario.update(req.body);

    res.json({
      ok: true,
      message: "Usuario actualizado correctamente",
      usuario,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al actualizar usuario",
      error: error.message,
    });
  }
};

const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado",
      });
    }

    await usuario.update({ estado: false });

    res.json({
      ok: true,
      message: "Usuario desactivado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al eliminar usuario",
      error: error.message,
    });
  }
};

module.exports = {
  listarUsuarios,
  crearUsuario,
  obtenerUsuarioPorId,
  actualizarUsuario,
  eliminarUsuario,
};