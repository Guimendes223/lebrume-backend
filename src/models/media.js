'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Media extends Model {
    static associate(models) {
      // A media item can belong to a CompanionProfile (e.g., profile picture, gallery item)
      Media.belongsTo(models.CompanionProfile, { foreignKey: 'companionProfileId', as: 'profileMedia', constraints: false });
      // A media item can belong to a Story
      Media.belongsTo(models.Story, { foreignKey: 'storyId', as: 'storyMedia', constraints: false });
      // A media item can belong to a VerificationRequest (e.g., ID document, selfie)
      Media.belongsTo(models.VerificationRequest, { foreignKey: 'verificationRequestId', as: 'verificationDocument', constraints: false });
      // A media item belongs to a User (the uploader)
      Media.belongsTo(models.User, { foreignKey: 'uploaderId', as: 'uploader', allowNull: false });
    }
  }
  Media.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    uploaderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    companionProfileId: { // Optional: if directly linked to a profile (e.g. main profile pic, gallery)
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'CompanionProfiles',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL' // Or 'CASCADE' if media should be deleted with profile
    },
    storyId: { // Optional: if part of a story
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Stories',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    verificationRequestId: { // Optional: if part of a verification request
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'VerificationRequests',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    mediaType: {
      type: DataTypes.ENUM('image', 'video'),
      allowNull: false,
    },
    fileUrl: { // URL to the media file in cloud storage
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: true,
      }
    },
    fileName: { // Original file name or a generated one
        type: DataTypes.STRING,
        allowNull: true,
    },
    fileSize: { // Size in bytes
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    mimeType: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    purpose: { // E.g., 'profile_picture', 'gallery_image', 'story_video', 'id_document', 'selfie_verification'
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
    modelName: 'Media',
    tableName: 'MediaFiles',
  });

  return Media;
};

