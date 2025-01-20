import axios from "axios";
import { create } from "zustand";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const usePlan = create((set) => ({
  plans: [],
  plan: {},
  error: false,
  loading: false,
  pagination: {
    total: 0,
    currentPage: 1,
    limit: 12,
    totalPages: 0,
    nextPage: false,
    prevPage: false,
  },
  fetchActivePlans: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${BASE_URL}/plan/active`, {
        withCredentials: true,
      });
      console.log(response.data.data);
      set({
        plans: response.data.data.activePlans,
        loading: false,
        pagination: response.data.data.pagination,
      });
      return response.data.data.activePlans;
    } catch (error) {
      console.log(error);
      set({ error: error.message, loading: false });
    }
  },
  getPlanDetailsById: async (planId) => {
    set({ error: null });
    try {
      const response = await axios.get(`${BASE_URL}/plan/${planId}`, {
        withCredentials: true,
      });
      set({ plan: response.data.data });
      return response.data.data;
    } catch (error) {
      console.log(error);
      set({ error: error.message });
    }
  },
  deletePlan: async (planId) => {
    set({ error: null });
    try {
      const response = await axios.delete(`${BASE_URL}/plan/delete/${planId}`, {
        withCredentials: true,
      });
      const plans = get().plans;
      const updatedPlans = plans.filter((plan) => plan.id !== planId);
      set({ plans: updatedPlans });
      return response.data;
    } catch (error) {
      console.log(error);
      set({ error: error.message });
    }
  },
 
  
}));

export default usePlan;
