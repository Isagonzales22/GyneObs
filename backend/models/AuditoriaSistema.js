module.exports = (sequelize, DataTypes) => {
  const AuditoriaSistema = sequelize.define(
    "AuditoriaSistema",
    {
      id_auditoria: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      id_usuario: {
        type: DataTypes.UUID,
        allowNull: true,
      },

      accion: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      tabla_afectada: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      id_registro_afectado: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      ip_origen: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      fecha_accion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },

    {
      tableName: "auditoria_sistema",
      timestamps: false,
    }
  );

  AuditoriaSistema.associate = (models) => {
    AuditoriaSistema.belongsTo(models.Usuario, {
      foreignKey: "id_usuario",
      as: "usuario",
    });
  };

  return AuditoriaSistema;
};