// src/services/card.api.js

import api from "./api";

export const cardApiService = {
  /**
   * Card generate karo
   */
  generateCard: async (username) => {
    const response = await api.get(
      `/api/card/generate/${username}`
    );
    return response.data;
  },
};