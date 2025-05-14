'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class VerificationRequest extends Model {
    static associate(models) {
      VerificationRequest.belongsTo(models.CompanionProfile, { foreignKey: 'companionProfileId', as: 'companionProfile' });
      // Se você decidir usar Media
      VerificationRequest.hasMany(models.Media, {
        foreignKey: 'verificationRequestId',
        as: 'verificationDocuments',
      });
    }
  }

  VerificationRequest.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    companionProfileId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'CompanionProfiles',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    idDocumentUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true,
        isAbsolute(value) {
          if (value && !/^https?:\/\//.test(value)) {
            throw new Error('URL must be absolute');
          }
        }
      }
    },
    idDocumentStatus: {
      type: DataTypes.ENUM('Pending', 'Approved', 'Rejected', 'NotSubmitted'),
      defaultValue: 'NotSubmitted',
    },
    selfieUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true,
      }
    },
    selfieStatus: {
      type: DataTypes.ENUM('Pending', 'Approved', 'Rejected', 'NotSubmitted'),
      defaultValue: 'NotSubmitted',
    },
    videoVerificationUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true,
      }
    },
    videoVerificationStatus: {
      type: DataTypes.ENUM('Pending', 'Approved', 'Rejected', 'NotSubmitted'),
      defaultValue: 'NotSubmitted',
    },
    overallStatus: {
      type: DataTypes.ENUM('PendingReview', 'Verified', 'Rejected', 'NotStarted', 'InProgress'),
      allowNull: false,
      defaultValue: 'NotStarted',
    },
    adminComments: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    trustLevel: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
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
    modelName: 'VerificationRequest',
    tableName: 'VerificationRequests',
  });

  return VerificationRequest;
};
