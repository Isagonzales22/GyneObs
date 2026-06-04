/**
 * Normaliza el rol 3 a PACIENTE (corrige PACIENTE_RESIDENTE u otros nombres legacy).
 * Ejecutar una vez: node update_role3.js
 */
const { sequelize, Rol } = require("./models");

async function updateRole3() {
  try {
    await sequelize.authenticate();
    console.log("Conexión establecida.");

    const [updated] = await Rol.update(
      {
        nombre_rol: "PACIENTE",
        descripcion: "Paciente de la Clínica",
      },
      { where: { id_rol: 3 } }
    );

    if (updated) {
      console.log("✅ Rol 3 actualizado a PACIENTE.");
    } else {
      await Rol.findOrCreate({
        where: { id_rol: 3 },
        defaults: {
          id_rol: 3,
          nombre_rol: "PACIENTE",
          descripcion: "Paciente de la Clínica",
        },
      });
      console.log("✅ Rol 3 creado como PACIENTE.");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

updateRole3();
