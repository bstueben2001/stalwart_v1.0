import api from './axiosInstance';

function normalize(relation) {
  return { ...relation, id: relation._id };
}

export async function fetchRelations() {
  const { data } = await api.get('/diplomacy');
  return data.map(normalize);
}

export async function createRelation(payload) {
  const { data } = await api.post('/diplomacy', payload);
  return normalize(data);
}

export async function updateRelation(id, payload) {
  const { data } = await api.put(`/diplomacy/${id}`, payload);
  return normalize(data);
}

export async function deleteRelation(id) {
  await api.delete(`/diplomacy/${id}`);
}
