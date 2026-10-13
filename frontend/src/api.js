// Central API base URL — reads from .env in production (set VITE_API_URL on Vercel)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export default API_URL;
