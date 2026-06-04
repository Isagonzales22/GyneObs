module.exports = (sequelize, DataTypes) => {
  const Rol = sequelize.define(
    "Rol",
    {
      id_rol: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre_rol: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "roles",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  Rol.associate = (models) => {
    Rol.hasMany(models.Usuario, {
      foreignKey: "id_rol",
      as: "usuarios",
    });
  };

  return Rol;
};