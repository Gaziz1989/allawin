module.exports = (sequelize, DataTypes) => {
  const Room = sequelize.define('Room', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    description: DataTypes.TEXT,
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'active'
    }
  })
  Room.associate = function (models) {
    models.Room.belongsTo(models.User, { as: 'owner' })
  }
  return Room
}
