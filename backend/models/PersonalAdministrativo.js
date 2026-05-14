module.exports = (sequelize, DataTypes) => {
  const PersonalAdministrativo = sequelize.define(
    "PersonalAdministrativo",
    {
      id_personal: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      id_usuario: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
      },
      cargo: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "personal_administrativo",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  PersonalAdministrativo.associate = (models) => {
    PersonalAdministrativo.belongsTo(models.Usuario, {
      foreignKey: "id_usuario",
      as: "usuario",
    });
  };

  return PersonalAdministrativo;
};