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
            
            const _room = '50bd6d29-ed8d-4619-bb32-ed446c333b30'
            // // // const _token = req.query.token
            let _token
            if (req.query.order_id === '33') {
                _token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImJmMjEyZGZiLTkyOTktNDllMi1iYzgwLTdhMzgwYTg0ZjA5MiIsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwibmFtZSI6bnVsbCwicGhvbmUiOm51bGwsImFkcmVzcyI6bnVsbCwicGFzc3dvcmQiOiIkMmEkMDgkSUFIdTlITTFiYjYvY2NBUkdaWE8xT3E1NTNBdnVMeEZDTW8va0cuQkloZXRoRGlDaVRMb1ciLCJhcmNoaXZlZCI6ZmFsc2UsInN0YXR1cyI6ImFjdGl2ZSIsInR5cGUiOiJhZG1pbiIsImltYWdlIjpudWxsLCJiaW8iOm51bGwsInRva2VuIjpudWxsLCJjcmVhdGVkQXQiOiIyMDE4LTA1LTI5VDExOjIxOjIzLjIwNloiLCJ1cGRhdGVkQXQiOiIyMDE4LTA1LTMxVDA5OjQ1OjUxLjU3N1oiLCJpYXQiOjE1Mjc3NjAwMjAsImV4cCI6MTYxNDE2MDAyMH0.-cRw4lXFyq5l3N8QwOA9MpNzcuZyqgvYkB0f8TMF-bM'
            } else {
                _token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImRlMjhhNGVlLTBhMTUtNDI5ZS05Y2U1LWVlYTU4ZmVlMzk1ZSIsImVtYWlsIjoicHJvQGdtYWlsLmNvbSIsIm5hbWUiOm51bGwsInBob25lIjpudWxsLCJhZHJlc3MiOm51bGwsInBhc3N3b3JkIjoiJDJhJDA4JEtUREZ5czBxQlZhaEhZNVJ4bGpZZnVrSG42azBGRzBFTU9MU1FqV1dqdGtpNDkuZUxqRHFtIiwiYXJjaGl2ZWQiOmZhbHNlLCJzdGF0dXMiOiJhY3RpdmUiLCJ0eXBlIjoicHJvIiwiaW1hZ2UiOm51bGwsImJpbyI6bnVsbCwidG9rZW4iOm51bGwsImNyZWF0ZWRBdCI6IjIwMTgtMDUtMjlUMTE6MjE6MjMuMjEwWiIsInVwZGF0ZWRBdCI6IjIwMTgtMDUtMzBUMDc6MTY6MjIuODMzWiIsImlhdCI6MTUyNzY2NjY2MywiZXhwIjoxNjE0MDY2NjYzfQ.NJfrrxska20qOav1q3TqB3mvoIqjgTVWq7jRcZ6vY0Q'
            }
            
            res.render('onlineSmsChat', {
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
