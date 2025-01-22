import { create } from "zustand";
import api from "@/lib/api";

const useAuth = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  role: null,
  error: null,
  loading: false,
  profileLoading: false,

  setLoadingState: (loading, error = null) => set({ loading, error }),

  setToken: (token) => {
    set({ token });
    localStorage.setItem("token", token);
    api.defaults.headers["Authorization"] = `Bearer ${token}`;
  },

  login: async ({ email, password, rememberMe }) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post(`/auth/login`, { email, password });
      const { token, username, role } = response.data.data;

      if (rememberMe) {
        localStorage.setItem("token", token);
      }

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
        error: error.response?.data?.error || "Login failed",
        loading: false,
      });
    }
  },

  signup: async (signupData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post(`/auth/studio/signup`, signupData);
      set({ user: response.data.data, error: null, loading: false });
    } catch (err) {
      const fieldErrors = err.response?.data?.message?.reduce((acc, error) => {
        acc[error.path] = error.msg;
        return acc;
      }, {}) || { error: err.message || "Signup failed" };

      set({ error: fieldErrors, loading: false });
    }
  },

  logout: async () => {
    set({ loading: true, error: null });
    try {
      await api.post(`/auth/logout`);
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

  editProfile: async (profileData) => {
    set({ profileLoading: true, error: null });
    try {
      const response = await api.put(`/auth/edit-profile`, profileData);
      set({
        user: response.data.data.user,
        error: null,
        profileLoading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Profile update failed",
        profileLoading: false,
      });
    }
  },

  initializeAuth: async () => {
    set({ loading: true, error: null });
    const token = localStorage.getItem("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.get(`/auth/current-user`);
        set({
          user: response.data.data,
          role: response.data.data.role,
          isAuthenticated: true,
          loading: false,
        });
      } catch (error) {
        set({ isAuthenticated: false, error: error.message });
      }
    }
  },
}));

export default useAuth;
