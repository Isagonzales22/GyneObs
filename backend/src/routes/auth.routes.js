const express = require("express");
const passport = require("passport");
const router = express.Router();

const { loginManual } = require("../controllers/auth.controller");

router.post("/login", loginManual);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=google`,
  }),
  (req, res) => {
    const { token, usuario } = req.user;

    res.redirect(
      `${process.env.FRONTEND_URL}/login/success?token=${token}&rol=${usuario.rol.nombre_rol}`
    );
  }
);

module.exports = router;