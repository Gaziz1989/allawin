const { Room, RoomSubscriber } = require('../models')
const path = require('path')
const request = require('request-promise-native')
const https = require('https')

const sendNotification = function(data) {
    return new Promise ((resolve, reject) => {
        var options = {
            host: "onesignal.com",
            port: 443,
            path: "/api/v1/notifications",
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Authorization": "Basic OGJiOWMwZDgtYzYxZC00M2ExLWI4MjUtNWU2ZmFiMzUwYWQ0"
            }
        }
          
        var req = https.request(options, function(res) {  
            res.on('data', function(data) {
                resolve(JSON.parse(data))
            })
        })
          
        req.on('error', function(e) {
            reject(e)
        })
          
        req.write(JSON.stringify(data))
        req.end()
    })
}



module.exports = {
    async connect (req, res) {
        try {
            // let info = await request({
            //     uri: `http://allawin.mars.studio/api/v1/ru/order/get-info-for-socket`,
            //     qs: {
            //         order_id: req.query.order_id,
            //         token: '312310fsdmoo432ij'
            //     },
            //     json: true
            // })
            // info = info.data
            
            const _room = '00de6cf7-077a-473c-9b10-c3ecbce38585'
            // // // const _token = req.query.token
            let _token
            if (req.query.order_id === '33') {
                _token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEwY2NiMTBjLTgzZTItNGE5My04OTlhLTcxYWFlMzU1MjMzNSIsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwibmFtZSI6bnVsbCwicGhvbmUiOm51bGwsImFkcmVzcyI6bnVsbCwicGFzc3dvcmQiOiIkMmEkMDgkNTU2UUZwTFZWVzNhOXJFWXYyTjhGZUxaTnB4Ni5EL1d1dU44RDhJNEVKV2trSlB4RGdjVHkiLCJhcmNoaXZlZCI6ZmFsc2UsInN0YXR1cyI6ImFjdGl2ZSIsInR5cGUiOiJhZG1pbiIsImltYWdlIjpudWxsLCJiaW8iOm51bGwsInRva2VuIjpudWxsLCJjcmVhdGVkQXQiOiIyMDE4LTA2LTA0VDExOjE1OjE4LjE0MFoiLCJ1cGRhdGVkQXQiOiIyMDE4LTA2LTA0VDExOjE1OjE4LjE0MFoiLCJpYXQiOjE1MjgxMTEwNzksImV4cCI6MTYxNDUxMTA3OX0.SNjS4-vBSnUCC2Q0KBbuMViYTp3a4Yoakq_HA7k3_gc'
            } else {
                _token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjgxMWMxODQxLTQwZGYtNGIxYi1hNmI3LTQ0OWUzMWI2MWVjMyIsImVtYWlsIjoidXNlcjFAZ21haWwuY29tIiwibmFtZSI6bnVsbCwicGhvbmUiOm51bGwsImFkcmVzcyI6bnVsbCwicGFzc3dvcmQiOiIkMmEkMDgkNFBZMTk4Z2RLRW4yRVQ1WDhYTFBnLkxkOHZVU21QWFpKdjU0a20zQXFHUmJLTEMvSE9SRkMiLCJhcmNoaXZlZCI6ZmFsc2UsInN0YXR1cyI6ImFjdGl2ZSIsInR5cGUiOiJ1c2VyIiwiaW1hZ2UiOm51bGwsImJpbyI6bnVsbCwidG9rZW4iOm51bGwsImNyZWF0ZWRBdCI6IjIwMTgtMDYtMDRUMTE6MTU6MTguMTQxWiIsInVwZGF0ZWRBdCI6IjIwMTgtMDYtMDRUMTE6MTU6MTguMTQxWiIsImlhdCI6MTUyODExNDI4MSwiZXhwIjoxNjE0NTE0MjgxfQ.mdNIqmwoXSSfyEmmb9djvXFeH-dnA06ZZJQy6HSbZK0'
            }
            
            res.render('onlineVideoChat', {
                room: _room,
                token: _token,
                fromMe: req.query.fromMe ? req.query.fromMe : false
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
            let message = {
                app_id: "f6fe8c7b-872d-41bc-823a-dd3426ab5206",
                contents: {"en": JSON.parse(req.body.message)},
                filters: [
                    {"field": "tag", "key": "id", "relation": "=", "value": "1bc71ae3-b783-43b8-83ba-a8c07e18faa4"}, 
                ]
            }
            let response = await sendNotification(message)
            console.log(response)
            res.send({
                message: 'Отправлено!'
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
