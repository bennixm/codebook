import axios from 'axios'
import { rewriteImageUrls } from './utils/imagekitRewrite' 

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});


api.interceptors.response.use(
  response => {
    if (response.data && typeof response.data === 'object') {
      response.data = rewriteImageUrls(response.data);
    }
    return response;
  },
  error => Promise.reject(error)
);

export default api;
