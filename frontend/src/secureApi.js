import api from './api';

const secureApi = api.create();
let csrfTokenPromise = null;

async function getCsrfToken() {
  if (!csrfTokenPromise) {
    csrfTokenPromise = api.get('/security/csrf-token').then(res => res.data.csrfToken);
  }
  return csrfTokenPromise;
}

secureApi.interceptors.request.use(async (config) => {
  const csrfToken = await getCsrfToken();
  config.headers['X-CSRF-Token'] = csrfToken;
  return config;
}, error => Promise.reject(error));

export default secureApi;
