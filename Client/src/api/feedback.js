import api from './axiosInstance';

export function submitFeedback(message) {
  return api.post('/feedback', { message });
}
