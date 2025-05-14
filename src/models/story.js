'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Story extends Model {
    static associate(models) {
      Story.belongsTo(models.CompanionProfile, { foreignKey: 'companionProfileId', as: 'companionProfile' });
      // Se histórias podem conter múltiplos itens de mídia:
      // Story.hasMany(models.Media, { foreignKey: 'storyId', as: 'mediaItems' }); 
      // Ou se uma história é um único item de mídia:
      // Story.belongsTo(models.Media, { foreignKey: 'mediaId', as: 'media' });
    }
  }

  Story.init({
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
    mediaUrl: { // URL para a mídia da história (imagem ou vídeo) armazenada em nuvem
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: true,
        isAbsolute(value) {
          if (value && !/^https?:\/\//.test(value)) {
            throw new Error('URL must be absolute');
          }
        }
      }
    },
    mediaType: {
      type: DataTypes.ENUM('image', 'video'),
      allowNull: false,
    },
    caption: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: () => {
        const now = new Date();
        return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 horas a partir da criação
      },
      validate: {
        isAfter: {
          args: new Date().toISOString(),
          msg: 'Expiration date must be in the future'
        }
      }
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
    modelName: 'Story',
    tableName: 'Stories',
  });

  return Story;
};
