import axios from 'axios';

const apiPublica = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api',
});

export default apiPublica;
