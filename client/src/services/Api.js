import axios from 'axios'
import Auth from '../utils/Auth'

export default () => {
  return axios.create({
    baseURL: `http://127.0.0.1:2018/`,
    headers: {
      Authorization: `Bearer ${Auth().getToken()}`
    }
  })
}
