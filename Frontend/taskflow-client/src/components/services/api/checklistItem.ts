// src/components/services/api/checklistItem.ts

import api from "./axios";

export interface ChecklistItem {
  id: number;
  content: string;
  completed: boolean;
  position: number;
  cardId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChecklistItemRequest {
  content: string;
  cardId: number;
  position?: number;
  completed?: boolean;
}

export const checklistItemService = {
  getChecklistItemsByCard: async (
    cardId: number | string
  ): Promise<ChecklistItem[]> => {
    const response = await api.get<ChecklistItem[]>(
      `/checklist-items/card/${cardId}`
    );
    return response.data;
  },

  createChecklistItem: async (
    data: CreateChecklistItemRequest
  ): Promise<ChecklistItem> => {
    const response = await api.post<ChecklistItem>("/checklist-items", data);
    return response.data;
  },

  updateChecklistItem: async (
    id: number | string,
    data: CreateChecklistItemRequest
  ): Promise<ChecklistItem> => {
    const response = await api.put<ChecklistItem>(
      `/checklist-items/${id}`,
      data
    );
    return response.data;
  },

  deleteChecklistItem: async (id: number | string): Promise<void> => {
    await api.delete(`/checklist-items/${id}`);
  },
};
