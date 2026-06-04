const { Medico, Usuario } = require("../../models");
const { normalizarRol } = require("../utils/roles");

const listarMedicos = async (req, res) => {
  try {
    const medicos = await Medico.findAll({
      include: [{ model: Usuario, as: "usuario" }],
    });
    res.json({ ok: true, medicos });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

const obtenerMedicoLogueado = async (req, res) => {
  try {
    let medico = await Medico.findOne({
      where: { id_usuario: req.usuario.id_usuario },
      include: [{ model: Usuario, as: "usuario" }],
    });

    if (!medico && normalizarRol(req.usuario?.rol?.nombre_rol) === "MEDICO") {
      medico = await Medico.create({
        id_usuario: req.usuario.id_usuario,
        especialidad: "Obstetricia y Ginecología",
        estado: true,
      });
      medico = await Medico.findByPk(medico.id_medico, {
        include: [{ model: Usuario, as: "usuario" }],
      });
    }

    if (!medico) {
      return res.status(404).json({
        ok: false,
        message: "No tienes un perfil de médico registrado",
      });
    }

    res.json({ ok: true, medico });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener perfil médico",
      error: error.message,
    });
  }
};

module.exports = { listarMedicos, obtenerMedicoLogueado };