module.exports = (sequelize, DataTypes) => {
  const Usuario = sequelize.define(
    "Usuario",
    {
      id_usuario: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      id_rol: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      google_id: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },

      correo_electronico: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },

      password_hash: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      primer_nombre: {
        type: DataTypes.STRING(80),
        allowNull: false,
      },

      segundo_nombre: {
        type: DataTypes.STRING(80),
        allowNull: true,
      },

      primer_apellido: {
        type: DataTypes.STRING(80),
        allowNull: false,
      },

      segundo_apellido: {
        type: DataTypes.STRING(80),
        allowNull: true,
      },

      ci: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },

      complemento_ci: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },

      telefono: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },

      fecha_nacimiento: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },

      sexo: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },

      direccion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      foto_perfil_url: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },

      ultimo_acceso: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },

    {
      tableName: "usuarios",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  Usuario.associate = (models) => {

    Usuario.belongsTo(models.Rol, {
      foreignKey: "id_rol",
      as: "rol",
    });

    Usuario.hasOne(models.Paciente, {
      foreignKey: "id_usuario",
      as: "paciente",
    });

    Usuario.hasOne(models.Medico, {
      foreignKey: "id_usuario",
      as: "medico",
    });

    Usuario.hasOne(models.PersonalAdministrativo, {
      foreignKey: "id_usuario",
      as: "personalAdministrativo",
    });
  };

  return Usuario;
};