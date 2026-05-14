const { AntecedentePatologico } = require("../../models");

const crearAntecedentePatologico = async (req, res) => {
  try {
    const antecedente = await AntecedentePatologico.create(req.body);
    res.status(201).json({ ok: true, message: "Antecedente patológico creado correctamente", antecedente });
  } catch (error) {
    res.status(500).json({ ok: false, message: "Error al crear antecedente patológico", error: error.message });
  }
};

const obtenerAntecedentePatologico = async (req, res) => {
  try {
    const antecedente = await AntecedentePatologico.findByPk(req.params.id);
    if (!antecedente) return res.status(404).json({ ok: false, message: "Antecedente patológico no encontrado" });
    res.json({ ok: true, antecedente });
  } catch (error) {
    res.status(500).json({ ok: false, message: "Error al obtener antecedente patológico", error: error.message });
  }
};

const actualizarAntecedentePatologico = async (req, res) => {
  try {
    const antecedente = await AntecedentePatologico.findByPk(req.params.id);
    if (!antecedente) return res.status(404).json({ ok: false, message: "Antecedente patológico no encontrado" });

    await antecedente.update(req.body);
    res.json({ ok: true, message: "Antecedente patológico actualizado correctamente", antecedente });
  } catch (error) {
    res.status(500).json({ ok: false, message: "Error al actualizar antecedente patológico", error: error.message });
  }
};

const eliminarAntecedentePatologico = async (req, res) => {
  try {
    const antecedente = await AntecedentePatologico.findByPk(req.params.id);
    if (!antecedente) return res.status(404).json({ ok: false, message: "Antecedente patológico no encontrado" });

    await antecedente.destroy();
    res.json({ ok: true, message: "Antecedente patológico eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ ok: false, message: "Error al eliminar antecedente patológico", error: error.message });
  }
};

module.exports = {
  crearAntecedentePatologico,
  obtenerAntecedentePatologico,
  actualizarAntecedentePatologico,
  eliminarAntecedentePatologico,
};