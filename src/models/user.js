'use strict';
const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs'); // Will need to install this

module.exports = (sequelize) => {
  class User extends Model {
    static associate(models) {
      // define association here
      User.hasOne(models.CompanionProfile, { foreignKey: 'userId', as: 'companionProfile' });
    }

    // Method to check password
    validPassword(password) {
      return bcrypt.compareSync(password, this.password);
    }
  }
  User.init({
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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true, // Assuming phone can be optional initially
    },
    userType: {
      type: DataTypes.ENUM('Client', 'Companion', 'Admin'), // Added Admin role as per system architecture
      allowNull: false,
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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
    modelName: 'User',
    tableName: 'Users',
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password') && user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  });
  return User;
};
