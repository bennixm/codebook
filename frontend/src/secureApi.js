import api from './api';

const secureApi = api.create();

secureApi.interceptors.request.use((config) => {
  return config;
}, error => Promise.reject(error));

export default secureApi;
