const { User } = require('../models')

module.exports = {
	async getusers (req, res) {
		try {
			let _users = await User.findAll({
                where: {
                    id: {
                        $ne: req.user.id
                    },
                    type: {
                        $ne: 'admin'
                    }
                }
            })
            res.send({
            	users: _users.map(item => {
                    return item.toJSON()
                })
            })
		} catch (error) {
			console.log(error)
		    res.status(500).send({
		      error: 'Произошла ошибка на сервере!'
		    })
		}
	}
}
