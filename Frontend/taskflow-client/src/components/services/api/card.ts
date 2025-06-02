import api from "./axios";
import { Label } from "./label";

export interface Card {
  id: number;
  title: string;
  description?: string;
  listId: number;
  position: number;
  dueDate?: string;
  labels: Label[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCardRequest {
  title: string;
  description?: string;
  listId: number;
  position?: number;
  dueDate?: string;
}

export const cardService = {
  getCardsByList: async (listId: number | string): Promise<Card[]> => {
    const response = await api.get<Card[]>(`/cards/list/${listId}`);
    return response.data;
  },

  createCard: async (data: CreateCardRequest): Promise<Card> => {
    const response = await api.post<Card>("/cards", data);
    return response.data;
  },

  updateCard: async (
    id: number | string,
    data: CreateCardRequest
  ): Promise<Card> => {
    const response = await api.put<Card>(`/cards/${id}`, data);
    return response.data;
  },

  deleteCard: async (id: number | string): Promise<void> => {
    await api.delete(`/cards/${id}`);
  },

  getCardDetails: async (id: number | string): Promise<Card> => {
    const response = await api.get<Card>(`/cards/${id}/details`);
    return response.data;
  },
};
