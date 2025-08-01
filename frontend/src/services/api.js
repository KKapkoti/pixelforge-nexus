//src/services/api.js

import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", //backend url
  withCredentials: false,
});

export default API;
