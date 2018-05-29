const { Room, RoomSubscriber } = require('../models')
const path = require('path')

module.exports = {
    async connect (req, res) {
        try {
            const _room = req.query.room
            res.render('homepage', {
                room: _room,
                token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2NTU1Y2EzLWVhZGEtNGMzYi05MjJkLTM2NTBhMjdjYTVmMCIsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwibmFtZSI6bnVsbCwicGhvbmUiOm51bGwsImFkcmVzcyI6bnVsbCwicGFzc3dvcmQiOiIkMmEkMDgkb3ZFbTRlWnRxU0pCQjZYQnBhbXpYTzE4Z0t5VnRnM2MwQkpvMnouNHpwWk9IREc4MEV4STYiLCJhcmNoaXZlZCI6ZmFsc2UsInN0YXR1cyI6ImFjdGl2ZSIsInR5cGUiOiJhZG1pbiIsImltYWdlIjpudWxsLCJiaW8iOm51bGwsInRva2VuIjpudWxsLCJjcmVhdGVkQXQiOiIyMDE4LTA1LTE4VDExOjA2OjQ0LjA5MloiLCJ1cGRhdGVkQXQiOiIyMDE4LTA1LTI5VDA2OjE1OjQ4LjA5MloiLCJpYXQiOjE1Mjc1NzczMzEsImV4cCI6MTYxMzk3NzMzMX0.ty0kzoXz_-ccX9lBq-fbtQcnzqSxhjM65swMeq8rCdQ'
            })
            // res.sendFile(path.resolve(__dirname, '../../static/htmls/chat.html'))
        } catch (error) {
            console.log(error)
            res.status(500).send({
              error: 'Произошла ошибка на сервере!'
            })
        }
    },
	async createroom (req, res) {
		try {
            let selected = JSON.parse(req.body.selected)
            let room = await Room.create({
                ownerId: req.user.id
            })
            let index = 0
            selected.map(async item => {
                await RoomSubscriber.create({
                    roomId: room.id,
                    userId: item
                })
                index++
                if (index === selected.length) {
                    res.send({
                        message: 'Создано!'
                    })
                }
            })
		} catch (error) {
			console.log(error)
		    res.status(500).send({
		      error: 'Произошла ошибка на сервере!'
		    })
		}
	},
    async getrooms (req, res) {
        try {
            let ownrooms = await Room.findAll({
                where: {
                    ownerId: req.user.id
                }
            })
            ownrooms = ownrooms.map(item => {
                return item.toJSON()
            })
            let rooms = await RoomSubscriber.findAll({
                where: {
                    userId: req.user.id,
                    status: 'active'
                },
                include: [
                    {
                        model: Room,
                        as: 'room'
                    }
                ]
            })
            rooms = rooms.filter(item => {
                if (item.room) {
                    return item.room.toJSON()
                }
            })
            rooms = rooms.map(item => {
                return item.room.toJSON()
            })
            let myrooms = await rooms.concat(ownrooms)
            res.send({myrooms})
        } catch (error) {
            console.log(error)
            res.status(500).send({
              error: 'Произошла ошибка на сервере!'
            })
        }
    }
}
