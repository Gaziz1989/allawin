import axios from 'axios'
import Auth from '../utils/Auth'

export default () => {
  return axios.create({
    baseURL: `http://138.68.103.82:2018/`,
    headers: {
      Authorization: `Bearer ${Auth().getToken()}`
    }
  })
}
