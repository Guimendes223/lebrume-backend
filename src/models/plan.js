'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Plan extends Model {
    static associate(models) {
      // Associação com Subscription (um Plano pode ter muitas assinaturas)
      Plan.hasMany(models.Subscription, { foreignKey: 'planId', as: 'subscriptions' });
    }
  }

  Plan.init({
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
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER, // Representado em meses, por exemplo
      allowNull: false,
    },
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
    modelName: 'Plan',
    tableName: 'Plans',
  });

  return Plan;
};
