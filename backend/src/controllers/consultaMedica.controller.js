const { ConsultaMedica, Paciente, Medico, HistoriaClinica } = require("../../models");

const crearConsultaMedica = async (req, res) => {
  try {
    const consulta = await ConsultaMedica.create(req.body);
    res.status(201).json({
      ok: true,
      message: "Consulta médica creada correctamente",
      consulta,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al crear consulta médica",
      error: error.message,
    });
  }
};

const listarConsultasMedicas = async (req, res) => {
  try {
    const consultas = await ConsultaMedica.findAll({
      include: [
        { model: Paciente, as: "paciente" },
        { model: Medico, as: "medico" },
        { model: HistoriaClinica, as: "historiaClinica" },
      ],
      order: [["created_at", "DESC"]],
    });

    res.json({ ok: true, consultas });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al listar consultas médicas",
      error: error.message,
    });
  }
};

const obtenerConsultaMedica = async (req, res) => {
  try {
    const consulta = await ConsultaMedica.findByPk(req.params.id, {
      include: [
        { model: Paciente, as: "paciente" },
        { model: Medico, as: "medico" },
        { model: HistoriaClinica, as: "historiaClinica" },
      ],
    });

    if (!consulta) {
      return res.status(404).json({
        ok: false,
        message: "Consulta médica no encontrada",
      });
    }

    res.json({ ok: true, consulta });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener consulta médica",
      error: error.message,
    });
  }
};

const actualizarConsultaMedica = async (req, res) => {
  try {
    const consulta = await ConsultaMedica.findByPk(req.params.id);

    if (!consulta) {
      return res.status(404).json({
        ok: false,
        message: "Consulta médica no encontrada",
      });
    }

    await consulta.update(req.body);

    res.json({
      ok: true,
      message: "Consulta médica actualizada correctamente",
      consulta,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al actualizar consulta médica",
      error: error.message,
    });
  }
};

const eliminarConsultaMedica = async (req, res) => {
  try {
    const consulta = await ConsultaMedica.findByPk(req.params.id);

    if (!consulta) {
      return res.status(404).json({
        ok: false,
        message: "Consulta médica no encontrada",
      });
    }

    await consulta.destroy();

    res.json({
      ok: true,
      message: "Consulta médica eliminada correctamente",
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al eliminar consulta médica",
      error: error.message,
    });
  }
};

module.exports = {
  crearConsultaMedica,
  listarConsultasMedicas,
  obtenerConsultaMedica,
  actualizarConsultaMedica,
  eliminarConsultaMedica,
};