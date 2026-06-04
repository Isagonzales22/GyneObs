const {
  AntecedenteGinecoObstetrico,
} = require("../../models");

const crearAntecedenteGO = async (req, res) => {
  try {

    const antecedente =
      await AntecedenteGinecoObstetrico.create(req.body);

    res.status(201).json({
      ok: true,
      message: "Antecedente gineco-obstétrico creado correctamente",
      antecedente,
    });

  } catch (error) {

    res.status(500).json({
      ok: false,
      message: "Error al crear antecedente",
      error: error.message,
    });

  }
};

const obtenerAntecedenteGO = async (req, res) => {
  try {

    const { id } = req.params;

    const antecedente =
      await AntecedenteGinecoObstetrico.findByPk(id);

    if (!antecedente) {
      return res.status(404).json({
        ok: false,
        message: "Antecedente no encontrado",
      });
    }

    res.json({
      ok: true,
      antecedente,
    });

  } catch (error) {

    res.status(500).json({
      ok: false,
      message: "Error al obtener antecedente",
      error: error.message,
    });

  }
};

const actualizarAntecedenteGO = async (req, res) => {
  try {

    const { id } = req.params;

    const antecedente =
      await AntecedenteGinecoObstetrico.findByPk(id);

    if (!antecedente) {
      return res.status(404).json({
        ok: false,
        message: "Antecedente no encontrado",
      });
    }

    await antecedente.update(req.body);

    res.json({
      ok: true,
      message: "Antecedente actualizado correctamente",
      antecedente,
    });

  } catch (error) {

    res.status(500).json({
      ok: false,
      message: "Error al actualizar antecedente",
      error: error.message,
    });

  }
};

module.exports = {
  crearAntecedenteGO,
  obtenerAntecedenteGO,
  actualizarAntecedenteGO,
};