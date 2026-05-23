/**
 * Script to update Role 4 from ENFERMERA to SECRETARIA in the database.
 * Run once: node update_role4.js
 */
const { sequelize, Rol } = require('./models');

async function updateRole4() {
  try {
    await sequelize.authenticate();
    console.log('Conexión establecida.');

    const [updated] = await Rol.update(
      {
        nombre_rol: 'SECRETARIA',
        descripcion: 'Secretaria - Gestión de Citas y Pacientes'
      },
      {
        where: { id_rol: 4 }
      }
    );

    if (updated) {
      console.log('✅ Rol 4 actualizado exitosamente a SECRETARIA.');
    } else {
      console.log('⚠️  No se encontró el Rol 4. Creando...');
      await Rol.findOrCreate({
        where: { id_rol: 4 },
        defaults: {
          id_rol: 4,
          nombre_rol: 'SECRETARIA',
          descripcion: 'Secretaria - Gestión de Citas y Pacientes'
        }
      });
      console.log('✅ Rol 4 creado como SECRETARIA.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateRole4();
