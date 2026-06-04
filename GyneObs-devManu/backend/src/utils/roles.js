const normalizarRol = (nombre) => {
  if (!nombre) return nombre;
  const n = String(nombre).toUpperCase();
  if (n.startsWith("PACIENTE")) return "PACIENTE";
  if (n.startsWith("MEDICO")) return "MEDICO";
  if (n.startsWith("SECRETARIA") || n === "ENFERMERA") return "SECRETARIA";
  return nombre;
};

const esPaciente = (usuario) => {
  const rol = normalizarRol(usuario?.rol?.nombre_rol);
  if (rol === "PACIENTE") return true;
  const idRol = Number(usuario?.rol?.id_rol ?? usuario?.id_rol);
  return idRol === 3;
};

module.exports = { normalizarRol, esPaciente };
