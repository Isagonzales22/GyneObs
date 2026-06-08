const { Paciente, Usuario, HistoriaClinica, Cita, Receta } = require("../../models");
const { esPaciente } = require("../utils/roles");

const listarPacientes = async (req, res) => {
  try {
    let where = {};
    
    // If the requester is a patient, only return their own record
    if (esPaciente(req.usuario)) {
      where.id_usuario = req.usuario.id_usuario;
    }
    
    const pacientes = await Paciente.findAll({
      where,
      include: [{
        model: Usuario,
        as: "usuario",
        where: { id_rol: 3 },
      }],
      order: [["created_at", "DESC"]],
    });

    res.json({ ok: true, pacientes });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al listar pacientes",
      error: error.message,
    });
  }
};

const crearPaciente = async (req, res) => {
  try {
    // Autogenerar codigo_paciente si no se proporciona
    if (!req.body.codigo_paciente) {
      const count = await Paciente.count();
      const codeNum = String(count + 1).padStart(4, '0');
      req.body.codigo_paciente = `PAC-${codeNum}`;
    }
    const paciente = await Paciente.create(req.body);

    res.status(201).json({
      ok: true,
      message: "Paciente creado correctamente",
      paciente,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al crear paciente",
      error: error.message,
    });
  }
};

const obtenerPacientePorId = async (req, res) => {
  try {
    const { id } = req.params;

    const paciente = await Paciente.findByPk(id, {
      include: [{ model: Usuario, as: "usuario" }],
    });

    if (!paciente) {
      return res.status(404).json({
        ok: false,
        message: "Paciente no encontrado",
      });
    }

    // Verify that a patient can only access their own record
    if (esPaciente(req.usuario) && paciente.id_usuario !== req.usuario.id_usuario) {
      return res.status(403).json({
        ok: false,
        message: "No tienes permiso para acceder a este paciente",
      });
    }

    res.json({ ok: true, paciente });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener paciente",
      error: error.message,
    });
  }
};

const actualizarPaciente = async (req, res) => {
  try {
    const { id } = req.params;

    const paciente = await Paciente.findByPk(id);

    if (!paciente) {
      return res.status(404).json({
        ok: false,
        message: "Paciente no encontrado",
      });
    }

    await paciente.update(req.body);

    res.json({
      ok: true,
      message: "Paciente actualizado correctamente",
      paciente,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al actualizar paciente",
      error: error.message,
    });
  }
};

const eliminarPaciente = async (req, res) => {
  try {
    const { id } = req.params;

    const paciente = await Paciente.findByPk(id);

    if (!paciente) {
      return res.status(404).json({
        ok: false,
        message: "Paciente no encontrado",
      });
    }

    // Verificar si tiene datos vinculados
    const historiales = await HistoriaClinica.count({ where: { id_paciente: id } });
    const citas = await Cita.count({ where: { id_paciente: id } });
    const recetas = await Receta.count({ 
      where: { 
        id_paciente: id
      } 
    });
    
    const tieneVinculos = historiales > 0 || citas > 0 || recetas > 0;
    let advertencia = null;

    if (tieneVinculos) {
      advertencia = `Advertencia: Este paciente tiene ${historiales} historial(es) clínico(s), ${citas} cita(s) y ${recetas} receta(s) vinculadas que también serán eliminadas.`;
    }

    // Eliminar datos vinculados primero
    if (historiales > 0) {
      await HistoriaClinica.destroy({ where: { id_paciente: id } });
    }
    if (citas > 0) {
      await Cita.destroy({ where: { id_paciente: id } });
    }
    if (recetas > 0) {
      await Receta.destroy({ where: { id_paciente: id } });
    }

    // Eliminar paciente
    await paciente.destroy();

    res.json({
      ok: true,
      message: "Paciente eliminado correctamente",
      advertencia: advertencia,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al eliminar paciente",
      error: error.message,
    });
  }
};

module.exports = {
  listarPacientes,
  crearPaciente,
  obtenerPacientePorId,
  actualizarPaciente,
  eliminarPaciente,
};