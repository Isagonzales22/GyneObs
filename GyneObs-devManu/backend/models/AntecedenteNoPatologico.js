module.exports = (sequelize, DataTypes) => {
  const AntecedenteNoPatologico = sequelize.define(
    "AntecedenteNoPatologico",
    {
      id_antecedente_no_patologico: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      id_historia_clinica: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      realiza_ejercicio: DataTypes.BOOLEAN,
      descripcion_ejercicio: DataTypes.TEXT,
      alimentacion: DataTypes.TEXT,
      consumo_agua: DataTypes.TEXT,
      consumo_tabaco: DataTypes.BOOLEAN,
      consumo_alcohol: DataTypes.BOOLEAN,
      consumo_drogas: DataTypes.BOOLEAN,
      habitos_sueno: DataTypes.TEXT,
      observaciones: DataTypes.TEXT,
    },
    {
      tableName: "antecedentes_no_patologicos",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  AntecedenteNoPatologico.associate = (models) => {
    AntecedenteNoPatologico.belongsTo(models.HistoriaClinica, {
      foreignKey: "id_historia_clinica",
      as: "historiaClinica",
    });
  };

  return AntecedenteNoPatologico;
};