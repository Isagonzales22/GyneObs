module.exports = (sequelize, DataTypes) => {
  const ExamenGinecologico = sequelize.define(
    "ExamenGinecologico",
    {
      id_examen_ginecologico: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      id_consulta: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      mamas: DataTypes.TEXT,
      abdomen: DataTypes.TEXT,
      genitales_externos: DataTypes.TEXT,
      especuloscopia: DataTypes.TEXT,
      tacto_vaginal: DataTypes.TEXT,
      flujo_vaginal: DataTypes.TEXT,
      dolor_pelvico: DataTypes.TEXT,
      observaciones: DataTypes.TEXT,
    },
    {
      tableName: "examenes_ginecologicos",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  ExamenGinecologico.associate = (models) => {
    ExamenGinecologico.belongsTo(models.ConsultaMedica, {
      foreignKey: "id_consulta",
      as: "consulta",
    });
  };

  return ExamenGinecologico;
};