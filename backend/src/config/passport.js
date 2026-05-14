const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const { Usuario, Rol, Paciente } = require("../../models");
const generarToken = require("../utils/generarToken");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        const correo = profile.emails?.[0]?.value;
        const googleId = profile.id;

        const nombres = profile.name?.givenName || "Paciente";
        const apellidos = profile.name?.familyName || "Google";

        let usuario = await Usuario.findOne({
          where: { correo_electronico: correo },
          include: [{ model: Rol, as: "rol" }],
        });

        if (!usuario) {
          const rolPaciente = await Rol.findOne({
            where: { nombre_rol: "PACIENTE" },
          });

          usuario = await Usuario.create({
            id_rol: rolPaciente.id_rol,
            google_id: googleId,
            correo_electronico: correo,
            primer_nombre: nombres,
            primer_apellido: apellidos,
            foto_perfil_url: profile.photos?.[0]?.value || null,
            estado: true,
          });

          await Paciente.create({
            id_usuario: usuario.id_usuario,
            codigo_paciente: `PAC-${Date.now()}`,
            observaciones: "Paciente registrado mediante Google",
          });

          usuario = await Usuario.findByPk(usuario.id_usuario, {
            include: [{ model: Rol, as: "rol" }],
          });
        } else {
          await usuario.update({
            google_id: googleId,
            foto_perfil_url: profile.photos?.[0]?.value || usuario.foto_perfil_url,
            ultimo_acceso: new Date(),
          });
        }

        const token = generarToken(usuario);

        return done(null, {
          usuario,
          token,
        });
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport;