const { AntecedenteFamiliar } = require("../../models");

const crearAntecedenteFamiliar = async (req, res) => {
  try {
    const antecedente = await AntecedenteFamiliar.create(req.body);

    res.status(201).json({
      ok: true,
      message: "Antecedente familiar creado correctamente",
      antecedente,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al crear antecedente familiar",
      error: error.message,
    });
  }
};

const obtenerAntecedenteFamiliar = async (req, res) => {
  try {
    const antecedente = await AntecedenteFamiliar.findByPk(req.params.id);

    if (!antecedente) {
      return res.status(404).json({
        ok: false,
        message: "Antecedente familiar no encontrado",
      });
    }

    res.json({ ok: true, antecedente });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener antecedente familiar",
      error: error.message,
    });
  }
};

const actualizarAntecedenteFamiliar = async (req, res) => {
  try {
    const antecedente = await AntecedenteFamiliar.findByPk(req.params.id);

    if (!antecedente) {
      return res.status(404).json({
        ok: false,
        message: "Antecedente familiar no encontrado",
      });
    }

    await antecedente.update(req.body);

    res.json({
      ok: true,
      message: "Antecedente familiar actualizado correctamente",
      antecedente,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al actualizar antecedente familiar",
      error: error.message,
    });
  }
};

const eliminarAntecedenteFamiliar = async (req, res) => {
  try {
    const antecedente = await AntecedenteFamiliar.findByPk(req.params.id);

    if (!antecedente) {
      return res.status(404).json({
        ok: false,
        message: "Antecedente familiar no encontrado",
      });
    }

    await antecedente.destroy();

    res.json({
      ok: true,
      message: "Antecedente familiar eliminado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al eliminar antecedente familiar",
      error: error.message,
    });
  }
};

module.exports = {
  crearAntecedenteFamiliar,
  obtenerAntecedenteFamiliar,
  actualizarAntecedenteFamiliar,
  eliminarAntecedenteFamiliar,
};