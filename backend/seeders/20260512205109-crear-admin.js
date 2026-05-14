"use strict";

const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

module.exports = {
  async up(queryInterface, Sequelize) {
    const passwordHash = await bcrypt.hash("admin123", 10);

    await queryInterface.bulkInsert("usuarios", [
      {
        id_usuario: uuidv4(),
        id_rol: 1,
        correo_electronico: "admin@ginecologia.com",
        password_hash: passwordHash,
        primer_nombre: "Admin",
        primer_apellido: "Sistema",
        estado: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("usuarios", {
      correo_electronico: "admin@ginecologia.com",
    });
  },
};