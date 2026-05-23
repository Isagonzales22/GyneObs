export const normalizarRol = (nombre) => {
  if (!nombre) return nombre;
  const n = String(nombre).toUpperCase();
  if (n.startsWith('PACIENTE')) return 'PACIENTE';
  if (n.startsWith('MEDICO')) return 'MEDICO';
  if (n.startsWith('SECRETARIA') || n === 'ENFERMERA') return 'SECRETARIA';
  return nombre;
};

export const esPaciente = (user) => {
  const rol = normalizarRol(user?.rol?.nombre_rol);
  if (rol === 'PACIENTE') return true;
  const idRol = Number(user?.rol?.id_rol ?? user?.id_rol);
  return idRol === 3;
};

export const getRolDisplayName = (user) => {
  const idRol = Number(user?.rol?.id_rol ?? user?.id_rol);
  const rol = normalizarRol(user?.rol?.nombre_rol);
  switch (rol) {
    case 'ADMINISTRADOR': return 'Administrador';
    case 'MEDICO': return 'Médico';
    case 'PACIENTE': return 'Paciente';
    case 'SECRETARIA': return 'Secretaria';
    default:
      if (idRol === 1) return 'Administrador';
      if (idRol === 2) return 'Médico';
      if (idRol === 3) return 'Paciente';
      if (idRol === 4) return 'Secretaria';
      return 'Usuario';
  }
};
