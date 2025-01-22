import axios from "axios";
import { create } from "zustand";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const useSubscription = create((set) => ({
  subscriptionSummary: {},
  subscriptionHistory: [],
  studioActiveSubsciptions: [],
  studioActiveSubsciptionsLoader: false,
  studioActiveSubsciptionsError: null,
  subscriptionSummaryLoader: false,
  subscriptionSummaryError: null,
  subscriptionHistoryLoader: false,
  subscriptionHistoryError: null,
  createSubscriptionLoader: false,
  createSubscriptionError: null,
  pagination: {
    total: 0,
    currentPage: 1,
    limit: 12,
    totalPages: 0,
    nextPage: false,
    prevPage: false,
  },
  createSubscription: async (planId) => {
    set({ createSubscriptionLoader: true, createSubscriptionError: null });
    try {
      const response = await axios.post(
        `${BASE_URL}/payment/create-razorpay-subscription`,
        {
          planId,
        },
        {
          withCredentials: true,
        }
      );
      set({ createSubscriptionLoader: false });
      return response.data.data;
    } catch (error) {
      console.log(error);
      set({
        createSubscriptionError: error.response.data.error,
        createSubscriptionLoader: false,
      });
    }
  },
  getAdminSubscriptionSummary: async () => {
    set({ subscriptionSummaryLoader: true, subscriptionSummaryError: null });
    try {
      const response = await axios.get(
        `${BASE_URL}/subscription/admin/summary`,
        {
          withCredentials: true,
        }
      );
      set({
        loadisubscriptionSummaryLoaderng: false,
        subscriptionSummary: response.data.data,
      });
      return response.data.data;
    } catch (error) {
      console.log(error);
      set({
        subscriptionSummaryError: error.message,
        loadisubscriptionSummaryLoaderng: false,
      });
    }
  },
  getSubscriptionHistoryForSuperAdmin: async () => {
    set({ subscriptionHistoryLoader: false, subscriptionHistoryError: null });
    try {
      const response = await axios.get(
        `${BASE_URL}/subscription/admin/history`,
        {
          withCredentials: true,
        }
      );
      set({
        subscriptionHistoryLoader: false,
        subscriptionHistory: response.data.data.subscriptions,
        pagination: response.data.data.pagination,
      });
      return response.data.data;
    } catch (error) {
      console.log(error);
      set({
        subscriptionHistoryError: error.message,
        subscriptionHistoryLoader: false,
      });
    }
  },
  getSubscriptionHistoryForStudio: async () => {
    set({ subscriptionHistoryLoader: false, subscriptionHistoryError: null });
    try {
      const response = await axios.get(
        `${BASE_URL}/subscription/studio/history`,
        {
          withCredentials: true,
        }
      );
      set({
        subscriptionHistoryLoader: false,
        subscriptionHistory: response.data.data.subscriptions,
        pagination: response.data.data.pagination,
      });
      return response.data.data;
    } catch (error) {
      console.log(error);
      set({
        subscriptionHistoryError: error.message,
        subscriptionHistoryLoader: false,
      });
    }
  },
  getStudioActiveSubsciption: async () => {
    set({
      studioActiveSubsciptionsError: null,
      studioActiveSubsciptionsLoader: true,
    });
    try {
      const response = await api.get(`/subscription/studio/active`);
      set({
        studioActiveSubsciptions: response.data.data.activeSubscriptions,
        studioActiveSubsciptionsLoader: false,
      });
      return response.data.data.activeSubscriptions;
    } catch (error) {
      console.log(error);
      set({
        studioActiveSubsciptionsError: error.response.data.error,
        studioActiveSubsciptionsLoader: false,
      });
    }
  },
}));

export default useSubscription;
