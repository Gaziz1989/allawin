const { User, Message } = require('../models')
const fs = require('fs')
var mime = require('mime')
const AccessToken = require('twilio').jwt.AccessToken
const ClientCapability = require('twilio').jwt.ClientCapability;
const VideoGrant = AccessToken.VideoGrant
require('dotenv').load()

module.exports = {
    async gettwiliotoken (req, res) {
        try {
            let token = new AccessToken(
                process.env.TWILIO_ACCOUNT_SID,
                process.env.TWILIO_API_KEY,
                process.env.TWILIO_API_SECRET
            )
            token.identity = req.user.email

            let grant = new VideoGrant()
            token.addGrant(grant)

            res.send({
                identity: req.user.email,
                token: token.toJwt()
            })
        } catch (error) {
            console.log(error)
            res.status(500).send({
              error: 'Произошла ошибка на сервере!'
            })
        }
    },
	async getmessages (req, res) {
		try {
            console.log(req.query)
            let messages = await Message.findAll({
                where: {
                    roomId: req.query.room
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
	}
}
