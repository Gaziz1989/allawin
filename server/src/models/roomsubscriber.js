module.exports = (sequelize, DataTypes) => {
  const RoomSubscriber = sequelize.define('RoomSubscriber', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'active'
    }
  })
  RoomSubscriber.associate = function (models) {
    models.RoomSubscriber.belongsTo(models.Room, { as: 'room' })
    models.RoomSubscriber.belongsTo(models.User, { as: 'user' })
  }
  return RoomSubscriber
}
