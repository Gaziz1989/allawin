module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    text: DataTypes.TEXT,
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'unread'
    }
  })
  Message.associate = function (models) {
    models.Message.belongsTo(models.User, { as: 'from' })
    models.Message.belongsTo(models.Room, { as: 'room' })
  }
  return Message
}
