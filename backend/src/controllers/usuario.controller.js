const bcrypt = require("bcryptjs");
const { Usuario, Rol, Medico, Paciente } = require("../../models");

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
    console.log("Datos recibidos:", req.body);
    
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
      foto_perfil_url
    } = req.body;

    // Validar campos requeridos
    if (!id_rol) {
      return res.status(400).json({
        ok: false,
        message: "El rol es obligatorio",
      });
    }

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
      id_rol: parseInt(id_rol),
      correo_electronico,
      password_hash,
      primer_nombre,
      segundo_nombre: segundo_nombre || null,
      primer_apellido,
      segundo_apellido: segundo_apellido || null,
      ci: ci || null,
      complemento_ci: complemento_ci || null,
      telefono: telefono || null,
      fecha_nacimiento: fecha_nacimiento || null,
      sexo: sexo || null,
      direccion: direccion || null,
      foto_perfil_url: null
    });

    // Si es médico o médico residente, crear registro en Medicos
    if (parseInt(id_rol) === 2 || parseInt(id_rol) === 3) {
      await Medico.create({
        id_usuario: usuario.id_usuario,
        especialidad: "Obstetricia y Ginecología",
        estado: true
      });
    }

    // Si es paciente, crear registro en Pacientes
    if (parseInt(id_rol) === 4) {
      const count = await Paciente.count();
      const codeNum = String(count + 1).padStart(4, '0');
      await Paciente.create({
        id_usuario: usuario.id_usuario,
        codigo_paciente: `PAC-${codeNum}`,
        ocupacion: "Ninguna",
        estado_civil: "Soltera",
        seguro_medico: "SUS",
        tipo_sangre: "O+",
        observaciones: "Creado automáticamente"
      });
    }

    // Obtener usuario con rol
    const usuarioConRol = await Usuario.findByPk(usuario.id_usuario, {
      include: [{ model: Rol, as: "rol" }],
    });

    res.status(201).json({
      ok: true,
      message: "Usuario creado correctamente",
      usuario: usuarioConRol,
    });
  } catch (error) {
    console.error("Error al crear usuario:", error);
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
    const { id_rol, password, foto_perfil_url } = req.body;

    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado",
      });
    }

    // Verificar si el rol existe
    if (id_rol) {
      const rolExiste = await Rol.findByPk(id_rol);
      if (!rolExiste) {
        return res.status(400).json({
          ok: false,
          message: "El rol especificado no existe",
        });
      }
    }

    // Si hay contraseña nueva, hashearla
    const updateData = { ...req.body };
    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10);
      delete updateData.password;
    }
    if (id_rol) updateData.id_rol = parseInt(id_rol);

    await usuario.update(updateData);

    // Si es médico o médico residente y no tiene registro en Medicos, crearlo
    if (id_rol && (parseInt(id_rol) === 2 || parseInt(id_rol) === 3)) {
      const exists = await Medico.findOne({ where: { id_usuario: id } });
      if (!exists) {
        await Medico.create({
          id_usuario: id,
          especialidad: "Obstetricia y Ginecología",
          estado: true
        });
      }
    }

    // Si es paciente y no tiene registro en Pacientes, crearlo
    if (id_rol && parseInt(id_rol) === 4) {
      const exists = await Paciente.findOne({ where: { id_usuario: id } });
      if (!exists) {
        const count = await Paciente.count();
        const codeNum = String(count + 1).padStart(4, '0');
        await Paciente.create({
          id_usuario: id,
          codigo_paciente: `PAC-${codeNum}`,
          ocupacion: "Ninguna",
          estado_civil: "Soltera",
          seguro_medico: "SUS",
          tipo_sangre: "O+",
          observaciones: "Creado automáticamente"
        });
      }
    }

    // Obtener el usuario actualizado con su rol
    const usuarioActualizado = await Usuario.findByPk(id, {
      include: [{ model: Rol, as: "rol" }],
    });

    res.json({
      ok: true,
      message: "Usuario actualizado correctamente",
      usuario: usuarioActualizado,
    });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
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