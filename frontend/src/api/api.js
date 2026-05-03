import axios from "axios"
import { clearSession, getToken } from "../utils/auth"

const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    (import.meta.env.DEV ? "http://localhost:5000/api" : "/api"),
})

API.interceptors.request.use((req) => {
  const token = getToken()
  if (token) req.headers.Authorization = `Bearer ${token}`
  return req
})

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) clearSession()
    return Promise.reject(error)
  },
)

export const getApiError = (error, fallback = "Something went wrong") =>
  error.response?.data?.message || error.response?.data || fallback

export default API
