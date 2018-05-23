import axios from 'axios'
import Auth from '../utils/Auth'
// https://chats-backend.mars.studio/
export default () => {
  return axios.create({
    baseURL: `https://chats-backend.mars.studio/`,
    headers: {
      Authorization: `Bearer ${Auth().getToken()}`
    }
  })
}
