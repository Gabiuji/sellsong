import axios from "axios";

// Cria uma instância centralizada do Axios para não termos que digitar
const api = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para injetar o Token JWT automaticamente em todas as requisições
// assim que o usuário fizer login no sistema
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("@SellSong:token");

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
