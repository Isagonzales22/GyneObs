const { ContenidoEducativo, CategoriaEducativa, Usuario } = require("../../models");

const crearContenido = async (req, res) => {
  try {
    const contenido = await ContenidoEducativo.create(req.body);

    res.status(201).json({
      ok: true,
      message: "Contenido educativo creado correctamente",
      contenido,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al crear contenido educativo",
      error: error.message,
    });
  }
};

const listarContenidos = async (req, res) => {
  try {
    const contenidos = await ContenidoEducativo.findAll({
      include: [
        { model: CategoriaEducativa, as: "categoria" },
        { model: Usuario, as: "autorUsuario" },
      ],
      order: [["created_at", "DESC"]],
    });

    res.json({ ok: true, contenidos });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al listar contenidos educativos",
      error: error.message,
    });
  }
};

const obtenerContenido = async (req, res) => {
  try {
    const contenido = await ContenidoEducativo.findByPk(req.params.id, {
      include: [
        { model: CategoriaEducativa, as: "categoria" },
        { model: Usuario, as: "autorUsuario" },
      ],
    });

    if (!contenido) {
      return res.status(404).json({
        ok: false,
        message: "Contenido educativo no encontrado",
      });
    }

    res.json({ ok: true, contenido });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener contenido educativo",
      error: error.message,
    });
  }
};

const actualizarContenido = async (req, res) => {
  try {
    const contenido = await ContenidoEducativo.findByPk(req.params.id);

    if (!contenido) {
      return res.status(404).json({
        ok: false,
        message: "Contenido educativo no encontrado",
      });
    }

    await contenido.update(req.body);

    res.json({
      ok: true,
      message: "Contenido educativo actualizado correctamente",
      contenido,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al actualizar contenido educativo",
      error: error.message,
    });
  }
};

const eliminarContenido = async (req, res) => {
  try {
    const contenido = await ContenidoEducativo.findByPk(req.params.id);

    if (!contenido) {
      return res.status(404).json({
        ok: false,
        message: "Contenido educativo no encontrado",
      });
    }

    await contenido.update({ estado: "ARCHIVADO" });

    res.json({
      ok: true,
      message: "Contenido educativo archivado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al eliminar contenido educativo",
      error: error.message,
    });
  }
};

module.exports = {
  crearContenido,
  listarContenidos,
  obtenerContenido,
  actualizarContenido,
  eliminarContenido,
};