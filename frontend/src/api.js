import axios from 'axios';
import { rewriteImageUrls } from './utils/imagekitRewrite';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

let csrfToken = null;

async function ensureCsrfToken() {
  if (!csrfToken) {
    const res = await api.get('/security/csrf-token');
    csrfToken = res.data.csrfToken;
  }
  return csrfToken;
}

api.interceptors.request.use(async config => {
  const method = config.method?.toLowerCase();

  if (['post', 'put', 'delete'].includes(method)) {
    const token = await ensureCsrfToken();
    config.headers['X-CSRF-Token'] = token;
  }

  return config;
}, error => Promise.reject(error));


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
