import axios, { CreateAxiosDefaults } from "axios";
import Cookies from "js-cookie";

export const URL = "http://localhost:5000";
const baseConfig: CreateAxiosDefaults = {
  baseURL: URL,
  headers: {
    "Content-Type": "application/json",
  },
};

const instanceWithoutInterceptors = axios.create(baseConfig);

instanceWithoutInterceptors.interceptors.request.use(
  function (config: any) {
    return config;
  },
  function (error: any) {
    return Promise.reject(error);
  }
);

instanceWithoutInterceptors.interceptors.response.use(
  function (response: any) {
    return response;
  },
  function (error: any) {
    const { config, status, data } = error.response;
    if (
      (config.url === "/api/v1/auth/register" && status === 400) ||
      (config.url === "/api/v1/auth/login" && status === 401)
    ) {
      const newError = data.msg;
      throw new Error(newError);
    }
    return Promise.reject(error);
  }
);

const instance = axios.create(baseConfig);

instance.interceptors.request.use(
  function (config: any) {
    const accessToken = Cookies.get("token");

    if (accessToken) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  function (error: any) {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  function (response: any) {
    return response;
  },
  function (error: any) {
    const { config, status, data } = error.response;
    if (
      (config.url === "/api/v1/auth/register" && status === 400) ||
      (config.url === "/api/v1/auth/login" && status === 401)
    ) {
      const newError = data.msg;
      throw new Error(newError);
    }
    return Promise.reject(error);
  }
);

export { instance, instanceWithoutInterceptors };
