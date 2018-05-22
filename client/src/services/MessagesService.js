import Api from '@/services/Api'

export default {
  getmessages (_room) {
    const formData = `room=${JSON.stringify(_room)}`
    return Api().post('getmessages', formData)
  },
  downloadfile (_msg) {
    const formData = `msg=${JSON.stringify(_msg)}`
    return Api().post('downloadfile', formData)
  },
  gettwiliotoken () {
    return Api().get('gettwilliotoken')
  }
}
