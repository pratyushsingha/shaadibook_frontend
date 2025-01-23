import axios from "axios";
import useAuth from "@/store/useAuth";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

if (typeof window !== "undefined") {
  // Request interceptor
  api.interceptors.request.use(
    (config) => {
      const token = useAuth.getState().token;
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (
        error.response &&
        error.response.status === 401 &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;

        try {
          const refreshResponse = await axios.post(
            `${BASE_URL}/auth/refresh-token`, // Fixed double slash
            {},
            { withCredentials: true }
          );

          const { token } = refreshResponse.data.data;
          useAuth.getState().setToken(token);

          api.defaults.headers["Authorization"] = `Bearer ${token}`;
          originalRequest.headers["Authorization"] = `Bearer ${token}`;

          return api(originalRequest);
        } catch (refreshError) {
          useAuth.getState().logout();
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );
}

export default api;