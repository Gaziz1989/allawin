import Api from '@/services/Api'

export default {
  createroom (_selected) {
    const formData = `selected=${JSON.stringify(_selected)}`
    return Api().post('createroom', formData)
  },
  getrooms () {
    return Api().get('getrooms')
  }
}
