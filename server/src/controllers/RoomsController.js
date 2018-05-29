const { Room, RoomSubscriber } = require('../models')
const path = require('path')
var OneSignal = require('onesignal-node')

module.exports = {
    async connect (req, res) {
        try {
            const _room = req.query.room
            // const _token = req.query.token
            const _token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU2MDMwNTU2LTU0YzgtNDQ2YS1hZDQ4LTkwODI4NmZkNTNhMyIsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwibmFtZSI6bnVsbCwicGhvbmUiOm51bGwsImFkcmVzcyI6bnVsbCwicGFzc3dvcmQiOiIkMmEkMDgkRkFHZXF1OXE5N3hBN3EyZC9mSllVLm5CZDdmZnFRUDZlRzY1dXoxU3hFSkF0LjJEaEpyZzYiLCJhcmNoaXZlZCI6ZmFsc2UsInN0YXR1cyI6ImFjdGl2ZSIsInR5cGUiOiJhZG1pbiIsImltYWdlIjpudWxsLCJiaW8iOm51bGwsInRva2VuIjpudWxsLCJjcmVhdGVkQXQiOiIyMDE4LTA1LTI5VDEyOjIzOjUyLjQ3N1oiLCJ1cGRhdGVkQXQiOiIyMDE4LTA1LTI5VDEyOjIzOjUyLjQ3N1oiLCJpYXQiOjE1Mjc1OTcwMDUsImV4cCI6MTYxMzk5NzAwNX0.3PVezkkjuxYYFuceIM25jVoDQytmL3ped39k5o6PIN4'
            res.render('homepage', {
                room: _room,
                token: _token
            })
            // res.sendFile(path.resolve(__dirname, '../../static/htmls/chat.html'))
        } catch (error) {
            console.log(error)
            res.status(500).send({
              error: 'Произошла ошибка на сервере!'
            })
        }
    },
    async pushnote (req, res) {
        try {
            console.log(req.body)
            var myClient = new OneSignal.Client({
                userAuthKey: 'OTJiOTJlY2UtZmVjNy00NGY3LThlNzEtMzM4Y2Q0NWY2YjM0',
                app: { appAuthKey: 'MGVlMGI0MWEtYzZlMS00ZWE3LTk0ZTItM2QyMTdjMGJhOTNk', appId: 'XXXXX' }
            })
                
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
