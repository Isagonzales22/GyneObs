const {
  HistoriaClinica,
  Paciente,
  Medico,
  AntecedenteGinecoObstetrico,
  EmbarazoPrevio,
  AntecedentePatologico,
  AntecedenteNoPatologico,
  AntecedenteFamiliar,
  ConsultaMedica,
} = require("../../models");

const listarHistoriasClinicas = async (req, res) => {
  try {
    const historias = await HistoriaClinica.findAll({
      include: [
        { model: Paciente, as: "paciente" },
        { model: Medico, as: "medico" },
      ],
      order: [["created_at", "DESC"]],
    });

    res.json({ ok: true, historias });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al listar historias clínicas",
      error: error.message,
    });
  }
};

const crearHistoriaClinica = async (req, res) => {
  try {
    const historia = await HistoriaClinica.create(req.body);

    res.status(201).json({
      ok: true,
      message: "Historia clínica creada correctamente",
      historia,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al crear historia clínica",
      error: error.message,
    });
  }
};

const obtenerHistoriaPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const historia = await HistoriaClinica.findByPk(id, {
      include: [
        { model: Paciente, as: "paciente" },
        { model: Medico, as: "medico" },
        { model: AntecedenteGinecoObstetrico, as: "antecedenteGO" },
        { model: EmbarazoPrevio, as: "embarazosPrevios" },
        { model: AntecedentePatologico, as: "antecedentePatologico" },
        { model: AntecedenteNoPatologico, as: "antecedenteNoPatologico" },
        { model: AntecedenteFamiliar, as: "antecedenteFamiliar" },
        { model: ConsultaMedica, as: "consultas" },
      ],
    });

    if (!historia) {
      return res.status(404).json({
        ok: false,
        message: "Historia clínica no encontrada",
      });
    }

    res.json({ ok: true, historia });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener historia clínica",
      error: error.message,
    });
  }
};

const actualizarHistoriaClinica = async (req, res) => {
  try {
    const { id } = req.params;

    const historia = await HistoriaClinica.findByPk(id);

    if (!historia) {
      return res.status(404).json({
        ok: false,
        message: "Historia clínica no encontrada",
      });
    }

    await historia.update(req.body);

    res.json({
      ok: true,
      message: "Historia clínica actualizada correctamente",
      historia,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al actualizar historia clínica",
      error: error.message,
    });
  }
};

const eliminarHistoriaClinica = async (req, res) => {
  try {
    const { id } = req.params;

    const historia = await HistoriaClinica.findByPk(id);

    if (!historia) {
      return res.status(404).json({
        ok: false,
        message: "Historia clínica no encontrada",
      });
    }

    await historia.update({ estado: false });

    res.json({
      ok: true,
      message: "Historia clínica desactivada correctamente",
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al eliminar historia clínica",
      error: error.message,
    });
  }
};

module.exports = {
  listarHistoriasClinicas,
  crearHistoriaClinica,
  obtenerHistoriaPorId,
  actualizarHistoriaClinica,
  eliminarHistoriaClinica,
};