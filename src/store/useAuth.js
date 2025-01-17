import { create } from "zustand";
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const useAuth = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  role: null,
  error: null,
  loading: false,
  profileLoading: false,

  setLoadingState: (loading, error = null) => set({ loading, error }),

  login: async ({ email, password, rememberMe }) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(
        `${BASE_URL}/auth/login`,
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );
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
      console.log(response.data.data);
      return response.data.data;
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

      set({ user: response.data.data, error: null, loading: false });
      return response.data.data;
    } catch (err) {
      const fieldErrors = err.response?.data?.message?.reduce((acc, error) => {
        acc[error.path] = error.msg;
        return acc;
      }, {}) || { error: err.message || "Signup failed" };

      set({
        error: fieldErrors,
        loading: false,
      });
    }
  },

  logout: async () => {
    set({ loading: true, error: null });
    try {
      await axios.post(
        `${BASE_URL}/auth/logout`,
        {},

        {
          withCredentials: true,
        }
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

  editProfile: async ({
    name,
    address,
    phoneNo,
    country,
    city,
    zipcode,
    logo,
    coverImage,
    studioName,
    about,
  }) => {
    set({ profileLoading: true, loading: false, error: null });
    try {
      const response = await axios.put(
        `${BASE_URL}/auth/edit-profile`,
        {
          name,
          address,
          phoneNo,
          country,
          city,
          zipcode,
          logo,
          coverImage,
          studioName,
          about,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      set({
        user: response.data.data.user,
        error: null,
        profileLoading: false,
      });
      return response.data.data.user;
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
      axios.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await axios.get(`${BASE_URL}/auth/current-user`);
        console.log(response.data.data);
        set({
          user: response.data.data,
          role: response.data.data.role,
          isAuthenticated: true,
          loading: false,
        });
      } catch (error) {
        console.error("Auth initialization failed", error);
        set({ isAuthenticated: false, error: error.message });
      }
    }
  },
}));

export default useAuth;
