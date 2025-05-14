// /home/ubuntu/lebrume_backend/src/models/companionProfile.js
'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class CompanionProfile extends Model {
    static associate(models) {
      // Relacionamento com a tabela Service através da tabela de junção CompanionService
      CompanionProfile.belongsToMany(models.Service, { 
        through: models.CompanionService, 
        foreignKey: 'companionProfileId',
        otherKey: 'serviceId',
        as: 'servicesOffering'
      });
    }
  }
  CompanionProfile.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    profileDescription: {
      type: DataTypes.TEXT,
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
    modelName: 'CompanionProfile',
    tableName: 'CompanionProfiles', // Nome da tabela CompanionProfiles
  });
  return CompanionProfile;
};
