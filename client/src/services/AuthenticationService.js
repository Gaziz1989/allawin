import Api from '@/services/Api'

export default {
  login (_credentials) {
    const credentials = JSON.stringify(_credentials)
    const formData = `user=${credentials}`
    return Api().post('login', formData)
  }
}
