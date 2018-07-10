const fs = require('fs')
const db = require('../db')
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
        let query = await db.query("SELECT *, msg.id as msg_id FROM message msg INNER JOIN \"user\" usr ON usr.id=msg.fromid INNER JOIN user_profile usr_prf ON usr_prf.user_id=msg.fromid WHERE msg.roomid = $1", [req.query.room])
        let messages = query.rows.map((item) => {
            return {
                id: item.msg_id,
                text: item.text,
                status: item.status,
                type: item.type,
                file: item.file,
                preview1: item.preview1,
                preview2: item.preview2,
                fromid: item.fromid,
                roomid: item.roomid,
                createdat: item.createdat,
                createdMlSec: new Date(item.createdat).getTime(),
                from: {
                    username: item.username,
                    email: item.email,
                    curency: item.curency,
                    user_id: item.user_id,
                    firstname: item.firstname,
                    middlename: item.middlename,
                    lastname: item.lastname,
                    avatar_path: item.avatar_path,
                    avatar_base_url: item.avatar_base_url,
                    locale: item.locale,
                    gender: item.gender,
                    is_professional: item.is_professional,
                    subcategory_id: item.subcategory_id,
                    experience: item.experience,
                    bday: item.bday,
                    bio: item.bio,
                    video: item.video,
                    phone: item.phone,
                    city_id: item.city_id,
                    avatar: item.avatar,
                    rating: item.rating
                }
            }
        }).sort((itemA, itemB) => {
            return itemA.createdMlSec - itemB.createdMlSec
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
