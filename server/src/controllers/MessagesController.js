const { User, Message } = require('../models')

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
                return item.toJSON()
            })
            res.send({messages})
		} catch (error) {
			console.log(error)
		    res.status(500).send({
		      error: 'Произошла ошибка на сервере!'
		    })
		}
	}
}
