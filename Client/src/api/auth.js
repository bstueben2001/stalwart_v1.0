import api from './axiosInstance';

export async function signup(username, email, password) {
  const res = await api.post('/auth/signup', { username, email, password });
  return res.data;
}

export async function login(identifier, password) {
  const res = await api.post('/auth/login', { identifier, password });
  return res.data;
}
