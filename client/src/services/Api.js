import axios from 'axios'
import Auth from '../utils/Auth'
// https://chats-backend.mars.studio/
// http://127.0.0.1:8081
export default () => {
  return axios.create({
    baseURL: `http://127.0.0.1:8081/`,
    headers: {
      Authorization: `Bearer ${Auth().getToken()}`
    }
  })
}
