// src/api/jikanApi.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.jikan.moe/v4',
});

export const fetchAnimeList = async (page = 1, filters: any = {}) => {
  const { data } = await api.get('/anime', {
    params: {
      page,
      ...filters,
    },
  });
  return data;
};

export const fetchAnimeDetails = async (id: number) => {
  const { data } = await api.get(`/anime/${id}`);
  return data;
};
