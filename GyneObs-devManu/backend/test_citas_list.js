const { sequelize, Cita, Paciente, Medico, TipoConsulta, Usuario } = require("./models");

async function test() {
  try {
    await sequelize.authenticate();
    console.log("Connected. Querying appointments...");
    const citas = await Cita.findAll({
      include: [
        { model: Paciente, as: "paciente" },
        { model: Medico, as: "medico" },
        { model: TipoConsulta, as: "tipoConsulta" },
        { model: Usuario, as: "usuarioCreador" },
      ],
    });
    console.log(`Success! Found ${citas.length} appointments.`);
    process.exit(0);
  } catch (error) {
    console.error("Query failed with error:", error);
    process.exit(1);
  }
}

test();
