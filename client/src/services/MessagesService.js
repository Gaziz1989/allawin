import Api from '@/services/Api'

export default {
  getmessages (_room) {
    return Api().get('getmessages?room=' + _room)
  },
  downloadfile (_msg) {
    const formData = `msg=${JSON.stringify(_msg)}`
    return Api().post('downloadfile', formData)
  },
  gettwiliotoken () {
    return Api().get('gettwilliotoken')
  }
}
