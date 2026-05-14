const { AntecedenteNoPatologico } = require("../../models");

const crearAntecedenteNoPatologico = async (req, res) => {
  try {
    const antecedente = await AntecedenteNoPatologico.create(req.body);
    res.status(201).json({ ok: true, message: "Antecedente no patológico creado correctamente", antecedente });
  } catch (error) {
    res.status(500).json({ ok: false, message: "Error al crear antecedente no patológico", error: error.message });
  }
};

const obtenerAntecedenteNoPatologico = async (req, res) => {
  try {
    const antecedente = await AntecedenteNoPatologico.findByPk(req.params.id);
    if (!antecedente) return res.status(404).json({ ok: false, message: "Antecedente no patológico no encontrado" });
    res.json({ ok: true, antecedente });
  } catch (error) {
    res.status(500).json({ ok: false, message: "Error al obtener antecedente no patológico", error: error.message });
  }
};

const actualizarAntecedenteNoPatologico = async (req, res) => {
  try {
    const antecedente = await AntecedenteNoPatologico.findByPk(req.params.id);
    if (!antecedente) return res.status(404).json({ ok: false, message: "Antecedente no patológico no encontrado" });

    await antecedente.update(req.body);
    res.json({ ok: true, message: "Antecedente no patológico actualizado correctamente", antecedente });
  } catch (error) {
    res.status(500).json({ ok: false, message: "Error al actualizar antecedente no patológico", error: error.message });
  }
};

const eliminarAntecedenteNoPatologico = async (req, res) => {
  try {
    const antecedente = await AntecedenteNoPatologico.findByPk(req.params.id);
    if (!antecedente) return res.status(404).json({ ok: false, message: "Antecedente no patológico no encontrado" });

    await antecedente.destroy();
    res.json({ ok: true, message: "Antecedente no patológico eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ ok: false, message: "Error al eliminar antecedente no patológico", error: error.message });
  }
};

module.exports = {
  crearAntecedenteNoPatologico,
  obtenerAntecedenteNoPatologico,
  actualizarAntecedenteNoPatologico,
  eliminarAntecedenteNoPatologico,
};
