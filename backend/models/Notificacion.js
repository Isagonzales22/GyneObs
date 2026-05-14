module.exports = (sequelize, DataTypes) => {
  const Notificacion = sequelize.define(
    "Notificacion",
    {
      id_notificacion: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      id_usuario: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      titulo: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      mensaje: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      tipo: DataTypes.STRING(50),
      leido: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      fecha_envio: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "notificaciones",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
    }
  );

  Notificacion.associate = (models) => {
    Notificacion.belongsTo(models.Usuario, {
      foreignKey: "id_usuario",
      as: "usuario",
    });
  };

  return Notificacion;
};