'use strict';
const { Model, DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  class CompanionProfile extends Model {
    static associate(models) {
      // Relationship with Service table through CompanionService junction table
      CompanionProfile.belongsToMany(models.Service, { 
        through: models.CompanionService, 
        foreignKey: 'companionProfileId',
        otherKey: 'serviceId',
        as: 'servicesOffering'
      });
      
      // Relationship with User table
      CompanionProfile.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
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
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    displayName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    profileDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    locationCity: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    locationState: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    locationCountry: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    aboutMe: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    servicesSummary: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ratesSummary: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    contactPhone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contactEmail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    profilePictureUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    privacySettings: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
    },
    availabilityStatus: {
      type: DataTypes.ENUM('Available', 'Busy', 'Away', 'Offline'),
      defaultValue: 'Offline',
    },
    // New fields for profile completeness and admin approval
    profileCompleteness: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0, // 0-100 percentage
      validate: {
        min: 0,
        max: 100
      }
    },
    isApproved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    approvedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isVisible: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false, // Only visible after approval and sufficient completeness
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
    tableName: 'CompanionProfiles',
    hooks: {
      beforeSave: (profile, options) => {
        // Calculate profile completeness based on filled fields
        let completedFields = 0;
        let totalFields = 0;
        
        // Count non-null fields that contribute to profile completeness
        const fieldsToCheck = [
          'displayName', 'profileDescription', 'locationCity', 'locationState', 
          'locationCountry', 'aboutMe', 'servicesSummary', 'ratesSummary', 
          'contactPhone', 'contactEmail', 'profilePictureUrl'
        ];
        
        fieldsToCheck.forEach(field => {
          totalFields++;
          if (profile[field] !== null && profile[field] !== undefined && profile[field] !== '') {
            completedFields++;
          }
        });
        
        // Calculate percentage of completion
        profile.profileCompleteness = Math.round((completedFields / totalFields) * 100);
        
        // Auto-set visibility based on approval and completeness
        profile.isVisible = profile.isApproved && profile.profileCompleteness >= 70; // Require at least 70% complete
      }
    }
  });
  return CompanionProfile;
};
