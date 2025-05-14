'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Rating extends Model {
    static associate(models) {
      Rating.belongsTo(models.User, { foreignKey: 'clientId', as: 'client' }); // The user who gave the rating
      Rating.belongsTo(models.CompanionProfile, { foreignKey: 'companionProfileId', as: 'companionProfile' }); // The companion who was rated
    }
  }
  Rating.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    companionProfileId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'CompanionProfiles',
        key: 'id', // Corrigido aqui
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1, // Assuming a 1-5 star rating system
        max: 5,
      },
    },
    reviewText: {
      type: DataTypes.TEXT,
      allowNull: true, // Review text can be optional
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
    modelName: 'Rating',
    tableName: 'Ratings',
    indexes: [
      // Add an index to prevent a client from rating the same companion multiple times, if that's a business rule
      // {
      //   unique: true,
      //   fields: ['clientId', 'companionProfileId']
      // }
    ]
  });
  return Rating;
};
