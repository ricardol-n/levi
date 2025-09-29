// src/admin/dataProvider.js
import { fetchUtils } from "react-admin";

const apiUrl = "/api"; // Vite proxy will forward /api → backend
const httpClient = (url, options = {}) => {
  if (!options.headers) {
    options.headers = new Headers({ Accept: "application/json" });
  }
  const token = localStorage.getItem("adminToken");
  if (token) {
    options.headers.set("Authorization", `Bearer ${token}`);
  }
  return fetchUtils.fetchJson(url, options);
};

const dataProvider = {
  // 📌 List resources
  getList: (resource, params) =>
    httpClient(`${apiUrl}/${resource}`).then(({ json }) => ({
      data: json.map((item) => ({ ...item, id: item._id })), // ✅ map _id
      total: json.length,
    })),

  // 📌 Get one record
  getOne: (resource, params) =>
    httpClient(`${apiUrl}/${resource}/${params.id}`).then(({ json }) => ({
      data: { ...json, id: json._id }, // ✅ map _id
    })),

  // 📌 Get many records by IDs
  getMany: (resource, params) => {
    const query = params.ids.map((id) => `id=${id}`).join("&");
    return httpClient(`${apiUrl}/${resource}?${query}`).then(({ json }) => ({
      data: json.map((item) => ({ ...item, id: item._id })), // ✅ map _id
    }));
  },

  // 📌 Create new record
  create: (resource, params) =>
    httpClient(`${apiUrl}/${resource}`, {
      method: "POST",
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({
      data: { ...params.data, id: json._id || json.id },
    })),

  // 📌 Update existing record
  update: (resource, params) => {
    const url =
      resource === "withdrawals"
        ? `${apiUrl}/${resource}/admin/update/${params.id}` // special route for withdrawals
        : `${apiUrl}/${resource}/${params.id}`;

    return httpClient(url, {
      method: resource === "withdrawals" ? "POST" : "PUT",
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({
      data: { ...json, id: json._id || json.id },
    }));
  },

  // 📌 Delete record
  delete: (resource, params) =>
    httpClient(`${apiUrl}/${resource}/${params.id}`, {
      method: "DELETE",
    }).then(({ json }) => ({
      data: { ...json, id: json._id || json.id },
    })),
};

export default dataProvider;
