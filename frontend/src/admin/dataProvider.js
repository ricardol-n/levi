import { fetchUtils } from "react-admin";
import jsonServerProvider  from "ra-data-json-server";

const httpClient = (url, options = {}) => {
  const token = localStorage.getItem("adminToken");
  if (!options.headers) {
    options.headers = new Headers({ Accept: "application/json" });
  }
  if (token) {
    options.headers.set("Authorization", `Bearer ${token}`);
  }
  return fetchUtils.fetchJson(url, options);
};

const dataProvider = jsonServerProvider("http://localhost:4000", httpClient);

export default dataProvider;
