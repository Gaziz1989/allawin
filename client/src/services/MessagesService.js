import Api from '@/services/Api'

export default {
  getmessages (_room) {
    const formData = `room=${JSON.stringify(_room)}`
    return Api().post('getmessages', formData)
  }
}
