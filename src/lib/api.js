import axios from 'axios';

const normalizeBaseUrl = (value) => {
  const trimmed = (value || 'http://localhost:5000').trim().replace(/\/+$/, '');

  if (!trimmed) {
    return 'http://localhost:5000';
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
};

export const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_URL || 'http://localhost:5000');

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
