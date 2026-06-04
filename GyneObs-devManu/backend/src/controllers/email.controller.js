const { enviarCorreo } = require("../services/email.service");

const enviarCorreoPrueba = async (req, res) => {
  try {
    const { correo } = req.body;

    await enviarCorreo({
      para: correo,
      asunto: "Prueba Sistema Ginecológico",
      html: `
        <h2>Correo de prueba</h2>
        <p>El sistema de notificaciones está funcionando correctamente.</p>
      `,
    });

    res.json({
      ok: true,
      message: "Correo enviado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al enviar correo",
      error: error.message,
    });
  }
};

module.exports = {
  enviarCorreoPrueba,
};