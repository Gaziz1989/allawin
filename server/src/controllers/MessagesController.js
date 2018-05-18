const { User, Message } = require('../models')
const fs = require('fs')
const path = require('path')
var mime = require('mime')

module.exports = {
	async getmessages (req, res) {
		try {
            let room = JSON.parse(req.body.room)
            let messages = await Message.findAll({
                where: {
                    roomId: room.id
                },
                include: [
                    {
                        model: User,
                        as: 'from'
                    }
                ]
            })
            messages = messages.map(item => {
                delete item.toJSON().from.token
                delete item.toJSON().from.password
                return item.toJSON()
            })
            res.send({messages})
		} catch (error) {
			console.log(error)
		    res.status(500).send({
		      error: 'Произошла ошибка на сервере!'
		    })
		}
	},
    async downloadfile (req, res) {
        try {
            let msg = JSON.parse(req.body.msg)
            var file = msg.file
            res.sendFile(file)
        } catch (error) {
            console.log(error)
            res.status(500).send({
              error: 'Произошла ошибка на сервере!'
            })
        }
    }
}
