import axios from 'axios';

const DEFAULT_PRODUCTION_API_URL = 'https://rafay-com-backend.vercel.app';

const normalizeBaseUrl = (value) => {
  const trimmed = (value || DEFAULT_PRODUCTION_API_URL).trim().replace(/\/+$/, '');

  if (!trimmed) {
    return DEFAULT_PRODUCTION_API_URL;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
};

export const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_URL || DEFAULT_PRODUCTION_API_URL);

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export const resolveApiUrl = (path = '') => {
  if (!path) return API_BASE_URL;
  if (/^https?:\/\//i.test(path)) return path;

  const cleanedPath = path.replace(/^\/+/, '');
  return `${API_BASE_URL}/${cleanedPath}`;
};

export const resolveImageUrl = (image) => {
  if (!image) return 'https://placehold.co/800x1000/efefef/111?text=No+Image';
  if (/^https?:\/\//i.test(image)) return image;
  if (image.startsWith('/')) return resolveApiUrl(image);
  return resolveApiUrl(`/images/${image}`);
};
