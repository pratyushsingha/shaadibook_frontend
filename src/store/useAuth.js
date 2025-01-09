import { create } from "zustand";
import axios from "axios";

const BASE_URL = "http://localhost:8080/api/v1";

const useAuth = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  role: null,
  error: null,
  loading: false,

  setLoadingState: (loading, error = null) => set({ loading, error }),

  login: async ({ email, password, rememberMe }) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        email,
        password,
      });
      const { token, username, role } = response.data.data;

      if (rememberMe) {
        localStorage.setItem("token", token);
      }

      axios.defaults.headers["Authorization"] = `Bearer ${token}`;

      set({
        user: username,
        token,
        role,
        isAuthenticated: true,
        error: null,
        loading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Login failed",
        loading: false,
      });
    }
  },

  signup: async ({
    name,
    username,
    email,
    password,
    studioName,
    phoneNo,
    address,
    role,
  }) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(
        `${BASE_URL}/auth/studio/signup`,
        {
          name,
          email,
          password,
          studioName,
          phoneNo,
          address,
          role,
          username,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      const { user } = response.data.data;
      set({ user, error: null, loading: false });
      return user;
    } catch (err) {
      if (err.response?.data?.message) {
        const fieldErrors = err.response.data.message.reduce((acc, error) => {
          acc[error.path] = error.msg;
          return acc;
        }, {});
        console.log(fieldErrors);
        set({
          error: fieldErrors,
          loading: false,
        });
      }
    }
  },

  logout: async () => {
    set({ loading: true, error: null });
    try {
      await axios.post(
        `${BASE_URL}/auth/logout`,
        {},
        { withCredentials: true }
      );
      localStorage.removeItem("token");
      set({
        user: null,
        token: null,
        role: null,
        isAuthenticated: false,
        error: null,
        loading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Logout failed",
        loading: false,
      });
    }
  },

  initializeAuth: async () => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const { data } = await axios.get(`${BASE_URL}/auth/me`);
        set({
          user: data.user,
          role: data.role,
          isAuthenticated: true,
        });
      } catch (error) {
        console.error("Auth initialization failed", error);
        set({ isAuthenticated: false });
      }
    }
  },
}));

export default useAuth;
