/** Extrae la URL de foto de la respuesta de upload (Cloudinary). */
export const extractFotoUrl = (response) => {
  const data = response?.data;
  return data?.fotoUrl || data?.foto_perfil_url || data?.url || null;
};

/** Obtiene la URL de foto de un usuario o objeto anidado con usuario. */
export const getUserFotoUrl = (entity) => {
  if (!entity) return null;
  return (
    entity.foto_perfil_url ||
    entity.fotoPerfilUrl ||
    entity.usuario?.foto_perfil_url ||
    entity.usuario?.fotoPerfilUrl ||
    null
  );
};
