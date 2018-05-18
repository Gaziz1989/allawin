const { User, Message, Room, RoomSubscriber } = require('../models')
const { Users } = require('../config/users')
const multiparty = require('multiparty')
const fs = require('fs')
const users = new Users()
const path = require('path')
const sharp = require('sharp')
const ffmpeg = require('ffmpeg')
const randomNumber = require("random-number-csprng")

module.exports = (io) => {

  	io.on('connection', (socket) => {
  		if (socket.connected) {
  			console.log('New user connected', socket.user.id)

		    socket.on('join', async (room) => {
		    	try {
		    		if (room) {
			    		socket.join(room.id, () => {
							// io.to(room.id).emit('updateUserList', users.getUserList(room.id))
							users.removeUser(socket.id)
						    users.addUser(socket.id, socket.user.email, room.id)

						    // io.to(room.id).emit('updateUserList', users.getUserList(room.id))
						    // socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app', 'unread', room.id))
						    socket.broadcast.to(room.id)
						      .emit('newMessage', {text: `${socket.user.email} has joined`,
						      	from: 'Allawin'})
			    		})
			    	}
		    	} catch (error) {
		    		console.log(error)
		    	}
			})

			socket.on('createMessage', async (msg) => {
				try {
					let user = users.getUser(socket.id)
					Message.create({
						text: msg.message,
						fromId: socket.user.id,
						roomId: msg.room.id,
						type: 'text'
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
						delete message.toJSON().from.token
						delete message.toJSON().from.password
						io.to(msg.room.id).emit('newMessage', message.toJSON())
					})
				} catch (error) {
					console.log(error)
				}
			})

			socket.on('uploadFile', async (file) => {
				try {
					const filepath = path.join(__dirname, `../../static/transferedfiles/${new Date().getTime()}_` + file.filename)
					fs.writeFile(filepath, file.file, (error) => {
						if (error) {
							console.log(error)
						}
						Message.create({
							text: file.filename,
							fromId: socket.user.id,
							roomId: file.room.id,
							file: filepath,
							type: 'file'
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
							delete message.toJSON().from.token
							delete message.toJSON().from.password
							io.to(file.room.id).emit('newMessage', message.toJSON())
						})
					})
				} catch (error) {
					console.log(error)
				}
			})

			socket.on('uploadVideo', async (file) => {
				try {
					const _length = file.filename.split('.').length
					const extension = file.filename.split('.')[_length - 1]
					const randomnumber = await randomNumber(999999, 999999999)
					const filepath = path.join(__dirname, `../../static/transferedvideos/${new Date().getTime()}_${randomnumber}.${extension}`)
					const previewpath1 = path.join(__dirname, `../../static/transferedvideos/previews/600_${new Date().getTime()}_${randomnumber}.${extension}`)
					const previewpath2 = path.join(__dirname, `../../static/transferedvideos/previews/300_${new Date().getTime()}_${randomnumber}.${extension}`)

					await fs.writeFile(filepath, file.video, async (error) => {
						if (error) {
							console.log(error)
						} else {
							const compressor = new ffmpeg(filepath)

							await compressor.then((video) => {
								let preview600 = video
								let preview300 = video
								preview600.setVideoSize('600x400', true, false).save(previewpath1)
								preview300.setVideoSize('300x200', true, false).save(previewpath2)
							})
						}
					})
					await Message.create({
						text: file.filename,
						fromId: socket.user.id,
						roomId: file.room.id,
						file: filepath,
						preview1: previewpath1,
						preview2: previewpath2,
						type: 'video'
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
						delete message.toJSON().from.token
						delete message.toJSON().from.password
						io.to(file.room.id).emit('newMessage', message.toJSON())
					})
				} catch (error) {
					console.log(error)
				}
			})

			socket.on('uploadAudio', async (file) => {
				try {
					console.log(file)
				} catch (error) {
					console.log(error)
				}
			})

			socket.on('uploadImage', async (file) => {
				try {
					const filepath = path.join(__dirname, `../../static/transferedimages/${new Date().getTime()}_` + file.filename)
					const previewpath1 = path.join(__dirname, `../../static/transferedimages/previews/600_${new Date().getTime()}_` + file.filename)
					const previewpath2 = path.join(__dirname, `../../static/transferedimages/previews/300_${new Date().getTime()}_` + file.filename)

					await sharp(file.photo).resize(1200, null).toFile(filepath)
					await sharp(file.photo).resize(600, null).toFile(previewpath1)
					await sharp(file.photo).resize(300, null).toFile(previewpath2)

					await Message.create({
						text: file.filename,
						fromId: socket.user.id,
						roomId: file.room.id,
						file: filepath,
						preview1: previewpath1,
						preview2: previewpath2,
						type: 'image'
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
						delete message.toJSON().from.token
						delete message.toJSON().from.password
						io.to(file.room.id).emit('newMessage', message.toJSON())
					})
				} catch (error) {
					console.log(error)
				}
			})

			socket.on('disconnect', (room) => {
				try {
					console.log(room)
					socket.leave(room.id, () => {
						socket.broadcast.to(room.id)
						.emit('newMessage', {text: `${socket.user.email} leave the room`,
						from: 'Allawin'})
					})
				} catch (error) {
					console.log(error)
				}
			})
  		} else {
        	return new Error("not connected")
  		}
  	})
}