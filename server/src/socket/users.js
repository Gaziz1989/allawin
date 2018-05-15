const { User } = require('../models')

module.exports = (io) => {
  io.sockets.on('connection', (socket) => {
    socket.on('getusers', async (_data) => {
        try {
            let _users = await User.findAll({
                where: {
                    id: {
                        $ne: socket.user.id
                    },
                    type: {
                        $ne: 'admin'
                    }
                }
            })
            io.emit('getusers', {
                users: _users.map(item => {
                    return item.toJSON()
                })
            })
        } catch (error) {
            console.log(error)
        }
    })
  })
}