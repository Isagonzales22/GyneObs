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
  Receta,
  DetalleReceta,
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
        {
          model: ConsultaMedica,
          as: "consultas",
          include: [
            {
              model: Receta,
              as: "receta",
              include: [{ model: DetalleReceta, as: "detalleReceta" }],
            },
          ],
        },
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

const obtenerHistoriaPorPaciente = async (req, res) => {
  try {
    const { pacienteId } = req.params;

    const historia = await HistoriaClinica.findOne({
      where: { id_paciente: pacienteId },
      include: [
        { model: Paciente, as: "paciente" },
        { model: Medico, as: "medico" },
        { model: AntecedenteGinecoObstetrico, as: "antecedenteGO" },
        { model: EmbarazoPrevio, as: "embarazosPrevios" },
        { model: AntecedentePatologico, as: "antecedentePatologico" },
        { model: AntecedenteNoPatologico, as: "antecedenteNoPatologico" },
        { model: AntecedenteFamiliar, as: "antecedenteFamiliar" },
        {
          model: ConsultaMedica,
          as: "consultas",
          include: [
            {
              model: Receta,
              as: "receta",
              include: [{ model: DetalleReceta, as: "detalleReceta" }],
            },
          ],
        },
      ],
      order: [
        [{ model: ConsultaMedica, as: 'consultas' }, 'fecha_consulta', 'DESC']
      ]
    });

    if (!historia) {
      return res.status(404).json({
        ok: false,
        message: "Historia clínica no encontrada para este paciente",
      });
    }

    res.json({ ok: true, historia });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener historia clínica por paciente",
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
  obtenerHistoriaPorPaciente,
  actualizarHistoriaClinica,
  eliminarHistoriaClinica,
};