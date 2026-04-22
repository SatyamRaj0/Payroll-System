import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status === 401 && !err.config._retry) {
      err.config._retry = true
      try {
        const refresh = localStorage.getItem('refresh_token')
        const { data } = await axios.post('/api/auth/refresh',
          { refreshToken: refresh })
        localStorage.setItem('access_token', data.data.accessToken)
        localStorage.setItem('refresh_token', data.data.refreshToken)
        err.config.headers.Authorization = `Bearer ${data.data.accessToken}`
        return api.request(err.config)
      } catch {
        localStorage.clear()
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api