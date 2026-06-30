import api from './axiosInstance';

function normalize(item) {
  return { ...item, id: item._id };
}

export async function fetchHealthGoals() {
  const { data } = await api.get('/health');
  return data.map(normalize);
}

export async function createHealthGoal(payload) {
  const { data } = await api.post('/health', payload);
  return normalize(data);
}

export async function updateHealthGoal(id, payload) {
  const { data } = await api.put(`/health/${id}`, payload);
  return normalize(data);
}

export async function deleteHealthGoal(id) {
  await api.delete(`/health/${id}`);
}
