const jwt = require("jsonwebtoken");
const { Usuario, Rol } = require("../../models");

const verificarToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        ok: false,
        message: "Token no enviado",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const usuario = await Usuario.findByPk(decoded.id_usuario, {
      include: [{ model: Rol, as: "rol" }],
    });

    if (!usuario) {
      return res.status(401).json({
        ok: false,
        message: "Usuario no encontrado",
      });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    return res.status(401).json({
      ok: false,
      message: "Token inválido o expirado",
    });
  }
};

const permitirRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    const rolUsuario = req.usuario?.rol?.nombre_rol;

    const rolesExtendidos = [...rolesPermitidos];
    if (rolesPermitidos.includes("MEDICO")) {
      rolesExtendidos.push("MEDICO_RESIDENTE", "SECRETARIA");
    }

    if (!rolesExtendidos.includes(rolUsuario)) {
      return res.status(403).json({
        ok: false,
        message: "No tienes permisos para acceder a esta ruta",
      });
    }

    next();
  };
};

module.exports = {
  verificarToken,
  permitirRoles,
};