const { User, Message, Room, RoomSubscriber } = require('../models')
const { Users } = require('../config/users')
const multiparty = require('multiparty')
const fs = require('fs')
const users = new Users()
const path = require('path')
const sharp = require('sharp')
const ffmpeg = require('ffmpeg')
const uuidv4 = require('uuid/v4')

const AWS = require('aws-sdk')
const spacesEndpoint = new AWS.Endpoint('nyc3.digitaloceanspaces.com')
const s3 = new AWS.S3({
    endpoint: spacesEndpoint,
    accessKeyId: '7EPP3JFIRC4EHZY3VVDO',
    secretAccessKey: 'JYLFXgCTusmGtGIh+qO74h/h598bKnTqC71E0gHjlCM'
})
let locationCreator = (data) => {
	if (data.Location.split('//')[0] === 'https:') {
		return data.Location
	} else {
		return `https://${data.Location}/${data.Key}`
	}
}
let extChecker = (_array, _ext) => {
	if (_array.indexOf(_ext) >= 0) {
		return true
	} else {
		return false
	}
}
let readFilePro = function (filename){
  return new Promise(function (resolve, reject) {
    fs.readFile(filename, (error, data) => {
	  if(error) {
	  	console.log(error)
		socket.emit('errorHandle', {
			text: error
		})
	  };
      resolve(new Buffer(data, 'binary'))
    })
  })
}
let uploadFile = function (_name, _bufer) {
	return new Promise (function (resolve, reject) {
		s3.upload({
			Bucket: 'allawin-chats',
			Key: _name,
			Body: _bufer,
			ACL: "public-read"
		}, function (error, data) {
			if (error) {
				console.log(error)
				socket.emit('errorHandle', {
					text: error
				})
			} else {
				resolve(data)
			}
		})
	})
}

module.exports = (io) => {

  	io.on('connection', (socket) => {
  		if (socket.connected) {
		    socket.on('join', async (room) => {
		    	try {
		    		if (room) {
			    		socket.join(room, () => {
			    			console.log(socket.user.id + ' connected to room: ' + room)
							// io.to(room).emit('updateUserList', users.getUserList(room))
							users.removeUser(socket.id)
						    users.addUser(socket.id, socket.user.email, room)

						    // io.to(room).emit('updateUserList', users.getUserList(room))
						    // socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app', 'unread', room))
						    socket.broadcast.to(room)
						      .emit('newMessage', {text: `${socket.user.email} has joined`,
						      	from: 'Allawin'})
			    		})
			    	}
		    	} catch (error) {
		    		console.log(error)
		    		socket.emit('errorHandle', {
						text: error
					})
		    	}
			})

			socket.on('createMessage', async (msg) => {
				try {
					// let user = users.getUser(socket.id)
					Message.create({
						text: msg.message,
						fromId: socket.user.id,
						roomId: msg.room,
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
						io.to(msg.room).emit('newMessage', message.toJSON())
					})
				} catch (error) {
					console.log(error)
					socket.emit('errorHandle', {
						text: error
					})
				}
			})
			socket.on('uploadFile', (file) => {
				try {
					const _length = file.filename.split('.').length
					const extension = file.filename.split('.')[_length - 1]
					const extArray = ['mp3', 'png', 'json', 'docx', 'doc', 'txt', 'rtf', 'docm', 'ppt', 'pptx', 'pptm', 'xps', 'potx', 'potm', 'pot', 'ppsx', 'pps', 'ppa', 'ppam', 'odp', 'pdf', 'xlsx', 'xlsm', 'xlsb', 'xlxt', 'xltm', 'xls', 'xlt', 'xml','xlam','xla','xlw']
					if (!extChecker(extArray, extension)) {
						return socket.emit('errorHandle', {
							text: 'Формат не поддерживается!'
						})
					}
					if (file.file.byteLength > 15242880) {
						return socket.emit('errorHandle', {
							text: 'Файл слишком большой!'
						})
					}
					s3.upload({
						Bucket: 'allawin-chats',
						Key: `${uuidv4().split('-').join('')}.${extension}`,
						Body: file.file,
						ACL: "public-read"
					}, function(err, data) {
  						Message.create({
							text: file.filename,
							fromId: socket.user.id,
							roomId: file.room,
							file: locationCreator(data),
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
							io.to(file.room).emit('newMessage', message.toJSON())
						})
					})
				} catch (error) {
					console.log(error)
					socket.emit('errorHandle', {
						text: error
					})
				}
			})

			socket.on('uploadVideo', (file) => {
				try {
					const _length = file.filename.split('.').length
					const extension = file.filename.split('.')[_length - 1]
					const extArray = ['avi', 'wmv', 'mov', 'asf', 'mpeg', 'mp4']
					if (!extChecker(extArray, extension)) {
						return socket.emit('errorHandle', {
							text: 'Формат не поддерживается!'
						})
					}
					if (file.video.byteLength > 5242880) {
						return socket.emit('errorHandle', {
							text: 'Файл слишком большой!'
						})
					}
					let name = `${uuidv4().split('-').join('')}.${extension}`
					const filepath = path.join(__dirname, `../../static/transferedvideos/${name}`)
					const _previewpath1 = path.join(__dirname, `../../static/transferedvideos/previews/600_${name}`)
					const _previewpath2 = path.join(__dirname, `../../static/transferedvideos/previews/300_${name}`)
					fs.writeFile(filepath, file.video, async (error) => {
						if (error) {
							console.log(error)
							return socket.emit('errorHandle', {
								text: error
							})
						} else {
							new Promise (function (resolve, reject){
								const compressor = new ffmpeg(filepath)
								compressor.then(async (video) => {
									let preview600 = video
									let preview300 = video
									await preview600.setVideoSize('600x400', true, false).save(_previewpath1)
									await preview300.setVideoSize('300x200', true, false).save(_previewpath2)
									resolve({
										_previewpath1, _previewpath2
									})
								})
							}).then(async data => {
								let previewpath = await readFilePro(filepath)
								let previewpath1 = await readFilePro(data._previewpath1)
								let previewpath2 = await readFilePro(data._previewpath2)
								return ({
									previewpath, previewpath1, previewpath2
								})
							}).then(async data => {
								let big = await uploadFile(name, data.previewpath)
								let middle = await uploadFile('600_' + name, data.previewpath1)
								let small = await uploadFile('300_' + name, data.previewpath2)
		  						Message.create({
									text: file.filename,
									fromId: socket.user.id,
									roomId: file.room,
									file: locationCreator(big),
								    preview1: locationCreator(middle),
								    preview2: locationCreator(small),
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
									io.to(file.room).emit('newMessage', message.toJSON())
									fs.unlink(filepath, (error) => {
										if (error) {
											console.log(error)
											return socket.emit('errorHandle', {
												text: error
											})
										}
									})
									fs.unlink(_previewpath1, (error) => {
										if (error) {
											console.log(error)
											return socket.emit('errorHandle', {
												text: error
											})
										}
									})
									fs.unlink(_previewpath2, (error) => {
										if (error) {
											console.log(error)
											return socket.emit('errorHandle', {
												text: error
											})
										}
									})
								})
							}).catch(error => {
								console.log(error)
								socket.emit('errorHandle', {
									text: error
								})
							})
						}
					})	
				} catch (error) {
					console.log(error)
					socket.emit('errorHandle', {
						text: error
					})
				}
			})

			socket.on('uploadAudio', (file) => {
				try {
					const _length = file.filename.split('.').length
					const extension = file.filename.split('.')[_length - 1]
					const extArray = ['mp3', 'wma', 'aiff', 'flac', 'm4a', 'aac', 'm4a']
					if (!extChecker(extArray, extension)) {
						return socket.emit('errorHandle', {
							text: 'Формат не поддерживается!'
						})
					}
					if (file.audio.byteLength > 5242880) {
						return socket.emit('errorHandle', {
							text: 'Файл слишком большой!'
						})
					}
					s3.upload({
						Bucket: 'allawin-chats',
						Key: `${uuidv4().split('-').join('')}.${extension}`,
						Body: file.audio,
						ACL: 'public-read'
					}, function(err, data) {
  						Message.create({
							text: file.filename,
							fromId: socket.user.id,
							roomId: file.room,
							file: locationCreator(data),
							type: 'audio'
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
							io.to(file.room).emit('newMessage', message.toJSON())
						})
					})
				} catch (error) {
					console.log(error)
					socket.emit('errorHandle', {
						text: error
					})
				}
			})

			socket.on('uploadImage', async (file) => {
				try {
					const _length = file.filename.split('.').length
					const extension = file.filename.split('.')[_length - 1]
					let name = `${uuidv4().split('-').join('')}.${extension}`
					const extArray = ['svg', 'webp', 'png', 'tif', 'gif', 'jpeg', 'jpg']
					if (!extChecker(extArray, extension)) {
						return socket.emit('errorHandle', {
							text: 'Формат не поддерживается!'
						})
					}
					if (file.photo.byteLength > 5242880) {
						return socket.emit('errorHandle', {
							text: 'Файл слишком большой!'
						})
					}
					let previewpath = await sharp(file.photo).resize(1200, null).toBuffer()
					let previewpath1 = await sharp(file.photo).resize(600, null).toBuffer()
					let previewpath2 = await sharp(file.photo).resize(300, null).toBuffer()

					let big = await uploadFile(name, previewpath)
					let middle = await uploadFile('600_' + name, previewpath1)
					let small = await uploadFile('300_' + name, previewpath2)

					await Message.create({
						text: file.filename,
						fromId: socket.user.id,
						roomId: file.room,
						file: locationCreator(big),
					    preview1: locationCreator(middle),
					    preview2: locationCreator(small),
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
						io.to(file.room).emit('newMessage', message.toJSON())
					})
				} catch (error) {
					console.log(error)
					socket.emit('errorHandle', {
						text: error
					})
				}
			})

			socket.on('disconnect', (room) => {
				try {
					socket.leave(room, () => {
						socket.broadcast.to(room)
						.emit('newMessage', {text: `${socket.user.email} leave the room`,
						from: 'Allawin'})
					})
				} catch (error) {
					console.log(error)
					socket.emit('errorHandle', {
						text: error
					})
				}
			})
  		} else {
        	return new Error("not connected")
  		}
  	})
}