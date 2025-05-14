// /home/ubuntu/lebrume_backend/src/models/companionService.js
'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class CompanionService extends Model {
    static associate(models) {
      CompanionService.belongsTo(models.CompanionProfile, { foreignKey: 'companionProfileId' });
      CompanionService.belongsTo(models.Service, { foreignKey: 'serviceId' });
    }
  }
  CompanionService.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    serviceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Services', // Referência à tabela Services
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    companionProfileId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'CompanionProfiles', // Referência à tabela CompanionProfiles
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    // Timestamps
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: 'CompanionService',
    tableName: 'CompanionServices', // Nome da tabela de junção
  });
  return CompanionService;
};
