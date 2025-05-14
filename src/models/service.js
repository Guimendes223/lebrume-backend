// /home/ubuntu/lebrume_backend/src/models/service.js
'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Service extends Model {
    static associate(models) {
      // Relacionamento muitos-para-muitos com CompanionProfile através da tabela CompanionService
      Service.belongsToMany(models.CompanionProfile, { 
        through: models.CompanionService, 
        foreignKey: 'serviceId',
        otherKey: 'companionProfileId',
        as: 'companionsOffering'
      });
    }
  }
  Service.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true // Assumindo que os nomes dos serviços são únicos
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category: { // Opcional: para agrupar serviços
      type: DataTypes.STRING,
      allowNull: true,
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
    modelName: 'Service',
    tableName: 'Services',
  });
  return Service;
};
