import api from './axiosInstance';

function normalize(item) {
  return { ...item, id: item._id };
}

export async function fetchBattleItems() {
  const { data } = await api.get('/battle');
  return data.map(normalize);
}

export async function createBattleItem(payload) {
  const { data } = await api.post('/battle', payload);
  return normalize(data);
}

export async function updateBattleItem(id, payload) {
  const { data } = await api.put(`/battle/${id}`, payload);
  return normalize(data);
}

export async function deleteBattleItem(id) {
  await api.delete(`/battle/${id}`);
}

export async function slayBattleItem(id) {
  const { data } = await api.post(`/battle/${id}/slay`);
  return data; // { difficulty }
}

export async function getBattleKills() {
  const { data } = await api.get('/battle/kills');
  return data; // { Minion: 3, Captain: 1, ... }
}
