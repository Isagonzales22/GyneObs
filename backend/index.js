require("dotenv").config();

const app = require("./src/app");

const { sequelize } = require("./models");

const PORT = process.env.PORT || 3000;

sequelize
  .sync({ alter: true })
  .then(() => {

    console.log("Base de datos sincronizada correctamente");

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });

  })
  .catch((error) => {
    console.error("Error al conectar con la base de datos:", error);
  });