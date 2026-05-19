// backend/src/controllers/medico.controller.js
const { Medico, Usuario } = require("../../models");

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

module.exports = { listarMedicos };