import axios from "axios";
import { create } from "zustand";
import api from "@/lib/api";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const useAlbum = create((set, get) => ({
  albums: [],
  album: {},
  error: false,
  pagination: {
    total: 0,
    currentPage: 1,
    limit: 12,
    totalPages: 0,
    nextPage: false,
    prevPage: false,
  },
  loading: false,
  error: false,

  fetchStudioAlbums: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/album/studio`);
      console.log(response.data.data);
      set({
        albums: response.data.data.projects,
        loading: false,
        pagination: response.data.data.pagination,
      });
      return response.data.data.projects;
    } catch (error) {
      console.log(error);
      set({ error: error.message, loading: false });
    }
  },
  getAlbumDetailsById: async (albumId) => {
    set({ error: null, loading: true });
    try {
      const response = await api.get(`/album/${albumId}`);
      set({ album: response.data.data, loading: false });
      return response.data.data;
    } catch (error) {
      console.log(error);
      set({ error: error.response.data.error, loading: false });
    }
  },
  deleteAlbum: async (albumId) => {
    set({ error: null });
    try {
      const response = await axios.delete(
        `${BASE_URL}/album/delete/${albumId}`,
        {
          withCredentials: true,
        }
      );
      const albums = get().albums;
      const updatedAlbums = albums.filter((album) => album.id !== albumId);
      set({
        albums: updatedAlbums,
      });
      return response.data.data;
    } catch (error) {
      console.log(error);
      set({ error: error.message });
    }
  },
}));

export default useAlbum;
