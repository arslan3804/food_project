import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response.status === 401) {
      try {
        const refresh = localStorage.getItem('refresh');
        const { data } = await axios.post(`/jwt/refresh/`, { refresh });
        localStorage.setItem('access', data.access);
        error.config.headers.Authorization = `Bearer ${data.access}`;
        return axios(error.config);
      } catch (e) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
