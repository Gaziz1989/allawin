import Api from '@/services/Api'

export default {
  getusers () {
    return Api().get('getusers')
  }
}
