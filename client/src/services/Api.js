import axios from 'axios'
import Auth from '../utils/Auth'
// https://chats-backend.mars.studio:8081/
export default () => {
  return axios.create({
    baseURL: `https://chats-backend.mars.studio:8081/`,
    headers: {
      Authorization: `Bearer ${Auth().getToken()}`
    }
  })
}
