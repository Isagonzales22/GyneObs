const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const { sequelize, Rol, Usuario } = require("./models");

async function seedDefaults() {
  try {
    await sequelize.authenticate();
    console.log("Conexión establecida con la base de datos.");

    // Crear Roles
    const rolesData = [
      { id_rol: 1, nombre_rol: "ADMINISTRADOR", descripcion: "Administrador del Sistema" },
      { id_rol: 2, nombre_rol: "MEDICO", descripcion: "Médico Especialista" },
      { id_rol: 3, nombre_rol: "PACIENTE", descripcion: "Paciente de la Clínica" },
      { id_rol: 4, nombre_rol: "ENFERMERA", descripcion: "Personal de Enfermería" },
    ];

    for (const role of rolesData) {
      await Rol.findOrCreate({
        where: { id_rol: role.id_rol },
        defaults: role
      });
    }
    console.log("Roles verificados/creados.");

    // Crear Usuarios por Defecto
    const passwordHash = await bcrypt.hash("123456", 10);
    
    const usuariosData = [
      {
        id_usuario: uuidv4(),
        id_rol: 1,
        correo_electronico: "admin@clinica.com",
        password_hash: passwordHash,
        primer_nombre: "Admin",
        primer_apellido: "Sistema",
        estado: true,
      },
      {
        id_usuario: uuidv4(),
        id_rol: 2,
        correo_electronico: "medico@clinica.com",
        password_hash: passwordHash,
        primer_nombre: "Juan",
        primer_apellido: "Médico",
        estado: true,
      },
      {
        id_usuario: uuidv4(),
        id_rol: 3,
        correo_electronico: "paciente@clinica.com",
        password_hash: passwordHash,
        primer_nombre: "María",
        primer_apellido: "Paciente",
        estado: true,
      }
    ];

    for (const user of usuariosData) {
      const exists = await Usuario.findOne({ where: { correo_electronico: user.correo_electronico } });
      if (!exists) {
        await Usuario.create(user);
        console.log(`Usuario creado: ${user.correo_electronico}`);
      } else {
        console.log(`Usuario ya existe: ${user.correo_electronico}`);
      }
    }

    console.log("\n¡Proceso de seeding completado con éxito!");
    console.log("Credenciales por defecto (Contraseña para todos: 123456):");
    console.log("- admin@clinica.com (Administrador)");
    console.log("- medico@clinica.com (Médico)");
    console.log("- paciente@clinica.com (Paciente)");

    process.exit(0);
  } catch (error) {
    console.error("Error durante el seeding:", error);
    process.exit(1);
  }
}

seedDefaults();
