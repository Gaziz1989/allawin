const { Users } = require('../config/users')
const multiparty = require('multiparty')
const db = require('../db')
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
		return `https://${data.Location}`
	}
}
let extChecker = (_array, _ext) => {
	if (_array.indexOf(_ext) >= 0) {
		return true
	} else {
		return false
	}
}
let writeFilePro = function ( takeScreenShot, preview, size, fullPath, destinationFolder, fileName) {
	if (takeScreenShot) {
		return new Promise (function (resolve, reject) {
			preview.fnExtractFrameToJPG(destinationFolder, {
				start_time: 15,
				duration_time: 1,
				frame_rate: 1,
				size: size,
				file_name: fileName
			}, function (error, files) {
				if (error) {
					reject(error)
				} else {
					resolve(files)
				}
			})
		}).catch(error => {
			console.log(error)
			socket.emit('errorHandle', {
				text: error
			})
		})
	} else {
		return new Promise (function (resolve, reject) {
			preview.setVideoSize(size, true, false).save(fullPath, (error, file) => {
				if (error) {
					reject(error)
				} else {
					resolve(file)
				}
			})
		})
	}
}
let readFilePro = function (filename) {
	return new Promise(function (resolve, reject) {
		fs.readFile(filename, (error, data) => {
			if(error) {
				console.log(error)
				reject(error)
			}
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
			} else {
				console.log(data)
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
							console.log(socket.user.email + ' connected to room: ' + room)
							// io.to(room).emit('updateUserList', users.getUserList(room))
							users.removeUser(socket.user.id)
							users.addUser(socket.user, room)
							io.emit('getRoomOnlineUsers', users.users)
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
					let query = await db.query("INSERT INTO message (text, fromid, roomid, type) VALUES ($1, $2, $3, $4) RETURNING id", [msg.message, socket.user.id, msg.room, 'text'])
					let query2 = await db.query("SELECT *, msg.id as msg_id FROM message msg INNER JOIN \"user\" usr ON usr.id=msg.fromid INNER JOIN user_profile usr_prf ON usr_prf.user_id=msg.fromid WHERE msg.id=$1;", [query.rows[0].id])
					let message = {
						id: query2.rows[0].msg_id,
						text: query2.rows[0].text,
						status: query2.rows[0].status,
						type: query2.rows[0].type,
						file: query2.rows[0].file,
						preview1: query2.rows[0].preview1,
						preview2: query2.rows[0].preview2,
						fromid: query2.rows[0].fromid,
						roomid: query2.rows[0].roomid,
						createdat: query2.rows[0].createdat,
						from: {
							username: query2.rows[0].username,
							email: query2.rows[0].email,
							curency: query2.rows[0].curency,
							user_id: query2.rows[0].user_id,
							firstname: query2.rows[0].firstname,
							middlename: query2.rows[0].middlename,
							lastname: query2.rows[0].lastname,
							avatar_path: query2.rows[0].avatar_path,
							avatar_base_url: query2.rows[0].avatar_base_url,
							locale: query2.rows[0].locale,
							gender: query2.rows[0].gender,
							is_professional: query2.rows[0].is_professional,
							subcategory_id: query2.rows[0].subcategory_id,
							experience: query2.rows[0].experience,
							bday: query2.rows[0].bday,
							bio: query2.rows[0].bio,
							video: query2.rows[0].video,
							phone: query2.rows[0].phone,
							city_id: query2.rows[0].city_id,
							avatar: query2.rows[0].avatar,
							rating: query2.rows[0].rating
						}
					}
					io.to(msg.room).emit('newMessage', message)
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
					const extArray = ['json', 'docx', 'doc', 'txt', 'rtf', 'docm', 'ppt', 'pptx', 'pptm', 'xps', 'potx', 'potm', 'pot', 'ppsx', 'pps', 'ppa', 'ppam', 'odp', 'pdf', 'xlsx', 'xlsm', 'xlsb', 'xlxt', 'xltm', 'xls', 'xlt', 'xml','xlam','xla','xlw']
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
					}, async function(err, data) {
						let query = await db.query("INSERT INTO message (text, fromid, roomid, type, file) VALUES ($1, $2, $3, $4, $5) RETURNING id", [file.filename, socket.user.id, file.room, 'file', locationCreator(data)])
						let query2 = await db.query("SELECT *, msg.id as msg_id FROM message msg INNER JOIN \"user\" usr ON usr.id=msg.fromid INNER JOIN user_profile usr_prf ON usr_prf.user_id=msg.fromid WHERE msg.id=$1;", [query.rows[0].id])
						let message = {
							id: query2.rows[0].msg_id,
							text: query2.rows[0].text,
							status: query2.rows[0].status,
							type: query2.rows[0].type,
							file: query2.rows[0].file,
							preview1: query2.rows[0].preview1,
							preview2: query2.rows[0].preview2,
							fromid: query2.rows[0].fromid,
							roomid: query2.rows[0].roomid,
							createdat: query2.rows[0].createdat,
							from: {
								username: query2.rows[0].username,
								email: query2.rows[0].email,
								curency: query2.rows[0].curency,
								user_id: query2.rows[0].user_id,
								firstname: query2.rows[0].firstname,
								middlename: query2.rows[0].middlename,
								lastname: query2.rows[0].lastname,
								avatar_path: query2.rows[0].avatar_path,
								avatar_base_url: query2.rows[0].avatar_base_url,
								locale: query2.rows[0].locale,
								gender: query2.rows[0].gender,
								is_professional: query2.rows[0].is_professional,
								subcategory_id: query2.rows[0].subcategory_id,
								experience: query2.rows[0].experience,
								bday: query2.rows[0].bday,
								bio: query2.rows[0].bio,
								video: query2.rows[0].video,
								phone: query2.rows[0].phone,
								city_id: query2.rows[0].city_id,
								avatar: query2.rows[0].avatar,
								rating: query2.rows[0].rating
							}
						}
						io.to(file.room).emit('newMessage', message)
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
					const extArray = ['avi', 'wmv', 'mov', 'asf', 'mpeg', 'mp4', 'MOV']
					if (!extChecker(extArray, extension)) {
						return socket.emit('errorHandle', {
							text: 'Формат не поддерживается!'
						})
					}
					if (file.video.byteLength > 10242880) {
						return socket.emit('errorHandle', {
							text: 'Файл слишком большой!'
						})
					}
					let name = `${uuidv4().split('-').join('')}.${extension}`
					const filepath = path.join(__dirname, `../../static/transferedvideos/${name}`)
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
									let _previewpath1 = await writeFilePro(true, video, '600x400', path.join(__dirname, `../../static/transferedvideos/previews/600_${name}`), path.join(__dirname, `../../static/transferedvideos/previews/`), `600_${name}`)
									let _previewpath2 = await writeFilePro(true, video, '300x200', path.join(__dirname, `../../static/transferedvideos/previews/300_${name}`), path.join(__dirname, `../../static/transferedvideos/previews/`), `300_${name}`)
									resolve({
										_previewpath1, _previewpath2
									})
								})
							})
							.then(async data => {
								let bigBuffer = await readFilePro(filepath)
								let middleBuffer = await readFilePro(data._previewpath1[0])
								let smallBuffer = await readFilePro(data._previewpath2[0])
								let middleFilePath = data._previewpath1[0]
								let smallFilePath = data._previewpath2[0]
								return ({
									bigBuffer, middleBuffer, smallBuffer, middleFilePath, smallFilePath
								})
							})
							.then(async data => {
								console.log('Here')
								let big = await uploadFile(name, data.bigBuffer)
								let middle = await uploadFile('600_' + name, data.middleBuffer)
								let small = await uploadFile('300_' + name, data.smallBuffer)
								let query = await db.query("INSERT INTO message (text, fromid, roomid, type, file, preview1, preview2) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id", [file.filename, socket.user.id, file.room, 'video', locationCreator(big), locationCreator(middle), locationCreator(small)])
								let query2 = await db.query("SELECT *, msg.id as msg_id FROM message msg INNER JOIN \"user\" usr ON usr.id=msg.fromid INNER JOIN user_profile usr_prf ON usr_prf.user_id=msg.fromid WHERE msg.id=$1;", [query.rows[0].id])
								let message = {
									id: query2.rows[0].msg_id,
									text: query2.rows[0].text,
									status: query2.rows[0].status,
									type: query2.rows[0].type,
									file: query2.rows[0].file,
									preview1: query2.rows[0].preview1,
									preview2: query2.rows[0].preview2,
									fromid: query2.rows[0].fromid,
									roomid: query2.rows[0].roomid,
									createdat: query2.rows[0].createdat,
									from: {
										username: query2.rows[0].username,
										email: query2.rows[0].email,
										curency: query2.rows[0].curency,
										user_id: query2.rows[0].user_id,
										firstname: query2.rows[0].firstname,
										middlename: query2.rows[0].middlename,
										lastname: query2.rows[0].lastname,
										avatar_path: query2.rows[0].avatar_path,
										avatar_base_url: query2.rows[0].avatar_base_url,
										locale: query2.rows[0].locale,
										gender: query2.rows[0].gender,
										is_professional: query2.rows[0].is_professional,
										subcategory_id: query2.rows[0].subcategory_id,
										experience: query2.rows[0].experience,
										bday: query2.rows[0].bday,
										bio: query2.rows[0].bio,
										video: query2.rows[0].video,
										phone: query2.rows[0].phone,
										city_id: query2.rows[0].city_id,
										avatar: query2.rows[0].avatar,
										rating: query2.rows[0].rating
									}
								}
								io.to(file.room).emit('newMessage', message)
								fs.unlink(filepath, (error) => {
									if (error) {
										console.log(error)
										return socket.emit('errorHandle', {
											text: error
										})
									}
								})
								fs.unlink(data.middleFilePath, (error) => {
									if (error) {
										console.log(error)
										return socket.emit('errorHandle', {
											text: error
										})
									}
								})
								fs.unlink(data.smallFilePath, (error) => {
									if (error) {
										console.log(error)
										return socket.emit('errorHandle', {
											text: error
										})
									}
								})
							})
							.catch(error => {
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
					if (file.audio.byteLength > 10242880) {
						return socket.emit('errorHandle', {
							text: 'Файл слишком большой!'
						})
					}
					s3.upload({
						Bucket: 'allawin-chats',
						Key: `${uuidv4().split('-').join('')}.${extension}`,
						Body: file.audio,
						ACL: 'public-read'
					}, async function(err, data) {
						console.log(data)
						let query = await db.query("INSERT INTO message (text, fromid, roomid, type, file) VALUES ($1, $2, $3, $4, $5) RETURNING id", [file.filename, socket.user.id, file.room, 'audio', locationCreator(data)])
						let query2 = await db.query("SELECT *, msg.id as msg_id FROM message msg INNER JOIN \"user\" usr ON usr.id=msg.fromid INNER JOIN user_profile usr_prf ON usr_prf.user_id=msg.fromid WHERE msg.id=$1;", [query.rows[0].id])
						let message = {
							id: query2.rows[0].msg_id,
							text: query2.rows[0].text,
							status: query2.rows[0].status,
							type: query2.rows[0].type,
							file: query2.rows[0].file,
							preview1: query2.rows[0].preview1,
							preview2: query2.rows[0].preview2,
							fromid: query2.rows[0].fromid,
							roomid: query2.rows[0].roomid,
							createdat: query2.rows[0].createdat,
							from: {
								username: query2.rows[0].username,
								email: query2.rows[0].email,
								curency: query2.rows[0].curency,
								user_id: query2.rows[0].user_id,
								firstname: query2.rows[0].firstname,
								middlename: query2.rows[0].middlename,
								lastname: query2.rows[0].lastname,
								avatar_path: query2.rows[0].avatar_path,
								avatar_base_url: query2.rows[0].avatar_base_url,
								locale: query2.rows[0].locale,
								gender: query2.rows[0].gender,
								is_professional: query2.rows[0].is_professional,
								subcategory_id: query2.rows[0].subcategory_id,
								experience: query2.rows[0].experience,
								bday: query2.rows[0].bday,
								bio: query2.rows[0].bio,
								video: query2.rows[0].video,
								phone: query2.rows[0].phone,
								city_id: query2.rows[0].city_id,
								avatar: query2.rows[0].avatar,
								rating: query2.rows[0].rating
							}
						}
						io.to(file.room).emit('newMessage', message)
						// Message.create({
						// 	text: file.filename,
						// 	fromId: socket.user.id,
						// 	roomId: file.room,
						// 	file: locationCreator(data),
						// 	type: 'audio'
						// }).then(async created => {
						// 	let message = await Message.findOne({
						// 		where: {
						// 			id: created.id
						// 		},
						// 		include: [
						// 		{
						// 			model: User,
						// 			as: 'from'
						// 		}
						// 		]
						// 	})
						// 	delete message.toJSON().from.token
						// 	delete message.toJSON().from.password
						// 	io.to(file.room).emit('newMessage', message.toJSON())
						// })
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

			socket.on('leaveRoom', (room) => {
				try {
					socket.leave(room, () => {
						users.removeUser(socket.user.id)
						socket.broadcast.to(room)
						.emit('newMessage', {text: `${socket.user.email} leave the room`,
							from: 'Allawin'})
						console.log(socket.user.email + ' disconnected from room: ' + room)
					})
					// socket.disconnect(0)
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