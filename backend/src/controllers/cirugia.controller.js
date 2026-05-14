const { Cirugia, Paciente, Medico, TipoCirugia } = require("../../models");

const crearCirugia = async (req, res) => {
  try {
    const cirugia = await Cirugia.create(req.body);

    res.status(201).json({
      ok: true,
      message: "Cirugía creada correctamente",
      cirugia,
    });
  } catch (error) {
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
        { model: Paciente, as: "paciente" },
        { model: Medico, as: "medico" },
        { model: TipoCirugia, as: "tipoCirugia" },
      ],
      order: [["fecha_cirugia", "DESC"]],
    });

    res.json({ ok: true, cirugias });
  } catch (error) {
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
        { model: Paciente, as: "paciente" },
        { model: Medico, as: "medico" },
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

    res.json({
      ok: true,
      message: "Cirugía actualizada correctamente",
      cirugia,
    });
  } catch (error) {
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