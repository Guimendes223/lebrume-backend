'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Message extends Model {
    static associate(models) {
      Message.belongsTo(models.User, { foreignKey: 'senderId', as: 'sender' });
      Message.belongsTo(models.User, { foreignKey: 'receiverId', as: 'receiver' });
      // Optionally, messages can belong to a conversation/chat room if that's implemented
      // Message.belongsTo(models.Conversation, { foreignKey: 'conversationId', as: 'conversation' });
    }
  }
  Message.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE', // Or SET NULL if messages should be kept even if a user is deleted
    },
    receiverId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE', // Or SET NULL
    },
    // conversationId: { // If using conversation rooms
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: 'Conversations',
    //     key: 'id',
    //   }
    // },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    readStatus: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
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
    modelName: 'Message',
    tableName: 'Messages',
  });

  return Message;
};
