const { User, Message, Room, RoomSubscriber } = require('../models')

module.exports = (io) => {
  io.sockets.on('connection', (socket) => {
    console.log(socket.user.email)

    socket.on('joinroom', async (_data) => {
        socket.join(_data.id, () => {
            console.log('Socket connected to ' + socket.rooms[_data.id])
        })
    })

    socket.on('leaveroom', async (_data) => {
        socket.leave(_data.id, () => {
            console.log('Socket disconnected from ' + _data.id, socket.rooms)
        })
    })

    socket.on('createroom', async (_data) => {
        try {
            let room = await Room.create({
                ownerId: socket.user.id
            })
            let index = 0
            _data.selected.map(async item => {
                await RoomSubscriber.create({
                    roomId: room.id,
                    userId: item
                })
                index++
                if (index === _data.selected.length) {
                    socket.emit('createroom', {
                        room
                    })
                }
            })
        } catch (error) {
            console.log(error)
        }
    })

    socket.on('getrooms', async (_data) => {
        try {
            let ownrooms = await Room.findAll({
                where: {
                    ownerId: socket.user.id
                }
            })
            ownrooms = ownrooms.map(item => {
                return item.toJSON()
            })
            let rooms = await RoomSubscriber.findAll({
                where: {
                    userId: socket.user.id,
                    status: 'active'
                },
                include: [
                    {
                        model: Room,
                        as: 'room'
                    }
                ]
            })
            rooms = rooms.map(item => {
                return item.room.toJSON()
            })
            let myrooms = await rooms.concat(ownrooms)
            socket.emit('getrooms', myrooms)
        } catch (error) {
            console.log(error)
        }
    })
    
    socket.on('getmessages', async (_data) => {
        try {
            // await socket.join(_data.room.id, () => {
            //     console.log('Socket connected to ' + socket.rooms[_data.room.id])
            // })
            let messages = await Message.findAll({
                where: {
                    roomId: _data.room.id
                }
            })
            messages = messages.map(item => {
                return item.toJSON()
            })
            await io.sockets.in(socket.rooms[_data.room.id]).emit('getmessages', messages)
            // await socket.leave(socket.rooms[_data.room.id], () => {
            //     console.log('Socket disconnected from ' + _data.id, socket.rooms)
            // })
        } catch (error) {
            console.log(error)
        }
    })
    socket.on('send', async (_data) => {
        try {
            // await socket.join(_data.room.id, () => {
            //     console.log('Socket connected to ' + socket.rooms[_data.room.id])
            // })
            let { message, selected, room } = _data
            let _message = await Message.create({
                text: message,
                fromId: socket.user.id,
                roomId: room.id
            })
            await io.sockets.in(socket.rooms[_data.room.id]).emit('send', {
                message: _message.toJSON()
            })
            // await socket.leave(socket.rooms[_data.room.id], () => {
            //     console.log('Socket disconnected from ' + _data.id, socket.rooms)
            // })
        } catch (error) {
            console.log(error)
        }
    })
  })
}