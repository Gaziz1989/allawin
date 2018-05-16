const { User, Message, Room, RoomSubscriber } = require('../models')
const { Users } = require('../config/users')
const moment = require('moment')

const users = new Users()

module.exports = (io) => {
  	io.on('connection', (socket) => {
    	console.log('New user connected', socket.user.id)
	    socket.on('join', (room) => {
	    	if (room) {
	    		socket.join(room.id, () => {
					io.to(room.id).emit('updateUserList', users.getUserList(room.id))
					users.removeUser(socket.id)
				    users.addUser(socket.id, socket.user.email, room.id)

				    // io.to(room.id).emit('updateUserList', users.getUserList(room.id))
				    // socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app', 'unread', room.id))
				    socket.broadcast.to(room.id)
				      .emit('newMessage', {text: `${socket.user.email} has joined`,
				      	from: 'Allawin'})
	    		})
	    	}
		})

		socket.on('createMessage', (msg) => {
			let user = users.getUser(socket.id)
			if (user) {
				Message.create({
					text: msg.message,
					fromId: socket.user.id,
					roomId: user.room
				}).then(async created => {
					let message = await Message.findOne({
						where: {
		                    id: created.id
		                },
		                include: [
		                    {
		                        model: User,
		                        as: 'from'
		                    }
		                ]
					})
					io.to(user.room).emit('newMessage', message.toJSON())
				})
			}
		})

		socket.on('disconnect', (room) => {
			console.log(room)
			let user = users.removeUser(socket.id)
			// socket.leave(socket.id)
			if (user) {
				io.to(user.room).emit('newMessage', {from:'Allawin', text:`${user.name} has left`})
			}
		})
  	})
}