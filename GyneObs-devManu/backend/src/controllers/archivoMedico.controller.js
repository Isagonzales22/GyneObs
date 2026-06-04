const { ArchivoMedico } = require("../../models");

const subirArchivo = async (req, res) => {
  try {
    const {
      id_paciente,
      id_historia_clinica,
      descripcion,
      subido_por,
    } = req.body;

    if (!req.file) {
      return res.status(400).json({
        ok: false,
        message: "Debe seleccionar un archivo",
      });
    }

    const archivo = await ArchivoMedico.create({
      id_paciente,
      id_historia_clinica,
      descripcion,
      subido_por,
      nombre_archivo: req.file.originalname,
      tipo_archivo: req.file.mimetype,
      url_archivo: req.file.path,
    });

    res.status(201).json({
      ok: true,
      message: "Archivo subido correctamente",
      archivo,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al subir archivo",
      error: error.message,
    });
  }
};

const listarArchivos = async (req, res) => {
  try {
    const archivos = await ArchivoMedico.findAll({
      order: [["created_at", "DESC"]],
    });

    res.json({
      ok: true,
      archivos,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al listar archivos",
      error: error.message,
    });
  }
};

module.exports = {
  subirArchivo,
  listarArchivos,
};