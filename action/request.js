import axios from 'axios'

const isServer = process.env.VUE_ENV === 'server'


const instance = axios.create({
  baseURL: isServer ? 'https://cnodejs.org' : '/'
})

export default instance
