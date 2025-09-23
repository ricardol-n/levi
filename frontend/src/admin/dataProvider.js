// src/admin/dataProvider.js
import { fetchUtils } from 'react-admin';

const apiUrl = '/api'; // Vite proxy will forward /api → backend
const httpClient = (url, options = {}) => {
  if (!options.headers) {
    options.headers = new Headers({ Accept: 'application/json' });
  }
  const token = localStorage.getItem('token');
  if (token) {
    options.headers.set('Authorization', `Bearer ${token}`);
  }
  return fetchUtils.fetchJson(url, options);
};

const dataProvider = {
  // 📌 List resources
  getList: (resource, params) => {
    const url = `${apiUrl}/${resource}`;
    return httpClient(url).then(({ json }) => ({
      data: json,
      total: json.length,
    }));
  },

  // 📌 Get one record
  getOne: (resource, params) =>
    httpClient(`${apiUrl}/${resource}/${params.id}`).then(({ json }) => ({
      data: json,
    })),

  // 📌 Get many records by IDs
  getMany: (resource, params) => {
    const query = params.ids.map((id) => `id=${id}`).join('&');
    const url = `${apiUrl}/${resource}?${query}`;
    return httpClient(url).then(({ json }) => ({ data: json }));
  },

  // 📌 Create new record
  create: (resource, params) =>
    httpClient(`${apiUrl}/${resource}`, {
      method: 'POST',
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({
      data: { ...params.data, id: json._id || json.id },
    })),

  // 📌 Update existing record (approve/reject withdrawal, etc.)
  update: (resource, params) =>
    httpClient(`${apiUrl}/${resource}/${params.id}`, {
      method: 'PUT',
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({ data: json })),

  // 📌 Delete record
  delete: (resource, params) =>
    httpClient(`${apiUrl}/${resource}/${params.id}`, {
      method: 'DELETE',
    }).then(({ json }) => ({ data: json })),
};

export default dataProvider;
