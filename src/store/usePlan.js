import { create } from "zustand";
import api from "@/lib/api";

const usePlan = create((set, get) => ({
  plans: [],
  plan: {},
  error: false,
  loading: false,
  planDetailsLoading: false,
  planDetailsError: false,
  updatePlanLoading: false,
  updatePlanError: false,
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
      const response = await api.get(`/plan/active`);
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
  getAllPlans: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/plan`);
      set({
        plans: response.data.data.plans,
        loading: false,
        pagination: response.data.data.pagination,
      });
      return response.data.data.plans;
    } catch (error) {
      console.log(error);
      set({ error: error.message, loading: false });
    }
  },
  getPlanDetailsById: async (planId) => {
    set({ planDetailsError: null, planDetailsLoading: true, plan: {} });
    try {
      const response = await api.get(`/plan/${planId}`);
      set({ plan: response.data.data, planDetailsLoading: false });
      return response.data.data;
    } catch (error) {
      console.log(error);
      set({ error: error.message, plan: false, planDetailsLoading: false });
    }
  },
  deletePlan: async (planId) => {
    set({ error: null });
    try {
      const response = await api.delete(`/plan/${planId}`);
      const plans = get().plans;
      const updatedPlans = plans.map((plan) =>
        plan.id === planId ? { ...plan, status: "ARCHIVED" } : plan
      );
      set({ plans: updatedPlans });
      console.log(response.data.data);
      return response.data.data;
    } catch (error) {
      console.log(error);
      console.log(error.response.data.message);
      set({ error: error.message });
    }
  },
  updatePlan: async (planId, data) => {
    set({ updatePlanError: null, updatePlanLoading: true });
    try {
      const response = await api.put(`/plan/${planId}`, data);
      const plans = get().plans;
      const updatedPlans = plans.map((plan) =>
        plan.id === planId
          ? {
              ...response.data.data,
              duration: `${plan.duration > 0 ? `${plan.duration} days` : "-"}`,
              planType: `${plan.duration > 0 ? "RECURRING" : "ONE TIME"}`,
            }
          : plan
      );
      set({ plans: updatedPlans, updatePlanLoading: false });
      return response.data.data;
    } catch (error) {
      console.log(error);
      set({
        updatePlanError: error.response.data.error,
        updatePlanLoading: false,
      });
    }
  },
  createPlan: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post(`/plan/create`, data);
      set({ loading: false });
      return response.data.data;
    } catch (error) {
      console.log(error);
      set({ error: error.response.data.error, loading: false });
    }
  },
}));

export default usePlan;
