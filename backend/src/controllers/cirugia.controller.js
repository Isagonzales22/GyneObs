const { Cirugia, Paciente, Medico, TipoCirugia, Usuario } = require("../../models");

const crearCirugia = async (req, res) => {
  try {
    console.log("📝 Datos recibidos para crear cirugía:", req.body);
    
    // Validar campos requeridos
    const { id_paciente, id_medico, fecha_cirugia } = req.body;
    
    if (!id_paciente) {
      return res.status(400).json({
        ok: false,
        message: "El paciente es obligatorio",
      });
    }
    
    if (!id_medico) {
      return res.status(400).json({
        ok: false,
        message: "El médico es obligatorio",
      });
    }
    
    if (!fecha_cirugia) {
      return res.status(400).json({
        ok: false,
        message: "La fecha de cirugía es obligatoria",
      });
    }
    
    // Crear la cirugía - ENVIAR LOS UUIDs DIRECTAMENTE, SIN parsear a número
    const cirugia = await Cirugia.create({
      id_paciente: id_paciente, // UUID, no número
      id_medico: id_medico, // UUID, no número
      id_tipo_cirugia: req.body.id_tipo_cirugia || null,
      fecha_cirugia,
      hora_inicio: req.body.hora_inicio || null,
      hora_fin: req.body.hora_fin || null,
      diagnostico_preoperatorio: req.body.diagnostico_preoperatorio || null,
      procedimiento: req.body.procedimiento || null,
      estado_cirugia: req.body.estado_cirugia || 'PROGRAMADA'
    });

    // Obtener la cirugía completa con sus relaciones
    const cirugiaCompleta = await Cirugia.findByPk(cirugia.id_cirugia, {
      include: [
        { 
          model: Paciente, 
          as: "paciente",
          include: [{ model: Usuario, as: "usuario" }]
        },
        { 
          model: Medico, 
          as: "medico",
          include: [{ model: Usuario, as: "usuario" }]
        },
        { model: TipoCirugia, as: "tipoCirugia" },
      ],
    });

    res.status(201).json({
      ok: true,
      message: "Cirugía creada correctamente",
      cirugia: cirugiaCompleta,
    });
  } catch (error) {
    console.error("❌ Error al crear cirugía:", error);
    res.status(500).json({
      ok: false,
      message: "Error al crear cirugía",
      error: error.message,
    });
  }
};

const listarCirugias = async (req, res) => {
  try {
    const cirugias = await Cirugia.findAll({
      include: [
        { 
          model: Paciente, 
          as: "paciente",
          include: [{ model: Usuario, as: "usuario" }]
        },
        { 
          model: Medico, 
          as: "medico",
          include: [{ model: Usuario, as: "usuario" }]
        },
        { model: TipoCirugia, as: "tipoCirugia" },
      ],
      order: [["fecha_cirugia", "DESC"]],
    });

    res.json({ ok: true, cirugias });
  } catch (error) {
    console.error("❌ Error al listar cirugías:", error);
    res.status(500).json({
      ok: false,
      message: "Error al listar cirugías",
      error: error.message,
    });
  }
};

const obtenerCirugia = async (req, res) => {
  try {
    const cirugia = await Cirugia.findByPk(req.params.id, {
      include: [
        { 
          model: Paciente, 
          as: "paciente",
          include: [{ model: Usuario, as: "usuario" }]
        },
        { 
          model: Medico, 
          as: "medico",
          include: [{ model: Usuario, as: "usuario" }]
        },
        { model: TipoCirugia, as: "tipoCirugia" },
      ],
    });

    if (!cirugia) {
      return res.status(404).json({
        ok: false,
        message: "Cirugía no encontrada",
      });
    }

    res.json({ ok: true, cirugia });
  } catch (error) {
    console.error("❌ Error al obtener cirugía:", error);
    res.status(500).json({
      ok: false,
      message: "Error al obtener cirugía",
      error: error.message,
    });
  }
};

const actualizarCirugia = async (req, res) => {
  try {
    const cirugia = await Cirugia.findByPk(req.params.id);

    if (!cirugia) {
      return res.status(404).json({
        ok: false,
        message: "Cirugía no encontrada",
      });
    }

    await cirugia.update(req.body);

    // Obtener la cirugía actualizada con relaciones
    const cirugiaActualizada = await Cirugia.findByPk(req.params.id, {
      include: [
        { 
          model: Paciente, 
          as: "paciente",
          include: [{ model: Usuario, as: "usuario" }]
        },
        { 
          model: Medico, 
          as: "medico",
          include: [{ model: Usuario, as: "usuario" }]
        },
        { model: TipoCirugia, as: "tipoCirugia" },
      ],
    });

    res.json({
      ok: true,
      message: "Cirugía actualizada correctamente",
      cirugia: cirugiaActualizada,
    });
  } catch (error) {
    console.error("❌ Error al actualizar cirugía:", error);
    res.status(500).json({
      ok: false,
      message: "Error al actualizar cirugía",
      error: error.message,
    });
  }
};

const cancelarCirugia = async (req, res) => {
  try {
    const cirugia = await Cirugia.findByPk(req.params.id);

    if (!cirugia) {
      return res.status(404).json({
        ok: false,
        message: "Cirugía no encontrada",
      });
    }

    await cirugia.update({
      estado_cirugia: "CANCELADA",
      observaciones: req.body.observaciones || cirugia.observaciones,
    });

    res.json({
      ok: true,
      message: "Cirugía cancelada correctamente",
      cirugia,
    });
  } catch (error) {
    console.error("❌ Error al cancelar cirugía:", error);
    res.status(500).json({
      ok: false,
      message: "Error al cancelar cirugía",
      error: error.message,
    });
  }
};

const eliminarCirugia = async (req, res) => {
  try {
    const cirugia = await Cirugia.findByPk(req.params.id);

    if (!cirugia) {
      return res.status(404).json({
        ok: false,
        message: "Cirugía no encontrada",
      });
    }

    await cirugia.destroy();

    res.json({
      ok: true,
      message: "Cirugía eliminada correctamente",
    });
  } catch (error) {
    console.error("❌ Error al eliminar cirugía:", error);
    res.status(500).json({
      ok: false,
      message: "Error al eliminar cirugía",
      error: error.message,
    });
  }
};

module.exports = {
  crearCirugia,
  listarCirugias,
  obtenerCirugia,
  actualizarCirugia,
  cancelarCirugia,
  eliminarCirugia,
};