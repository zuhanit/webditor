import { globalConfig } from "@/utils/globalConfig";
import axios, { AxiosRequestConfig } from "axios";

const DEFAULT_CONFIG: AxiosRequestConfig = {
  baseURL: globalConfig.BASE_URL,
};

const api = axios.create(DEFAULT_CONFIG);

export default api;
