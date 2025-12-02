// src/services/favoritosService.js - CREAR
import { apiGet, apiPost, apiDelete } from './api';

export const getFavoritosByUsuario = async (usuarioId) => {
  const response = await apiGet(`/api/Favoritos/usuario/${usuarioId}`);
  return response;
};

export const addFavorito = async (favoritoData) => {
  const response = await apiPost('/api/Favoritos/crear', favoritoData);
  return response;
};

export const deleteFavorito = async (favoritoId) => {
  const response = await apiDelete(`/api/Favoritos/eliminar/${favoritoId}`);
  return response;
};

export default {
  getFavoritosByUsuario,
  addFavorito,
  deleteFavorito,
};