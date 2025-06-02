import api from "./axios";

export interface Label {
  id: number;
  name: string;
  color: string;
  boardId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLabelRequest {
  name: string;
  color: string;
  boardId: number;
}

export interface UpdateLabelRequest {
  name: string;
  color: string;
}

export const labelService = {
  getLabelsByBoard: async (boardId: number | string): Promise<Label[]> => {
    const response = await api.get<Label[]>(`/labels/board/${boardId}`);
    return response.data;
  },

  createLabel: async (data: CreateLabelRequest): Promise<Label> => {
    const response = await api.post<Label>("/labels", data);
    return response.data;
  },

  updateLabel: async (
    id: number | string,
    data: UpdateLabelRequest
  ): Promise<Label> => {
    const response = await api.put<Label>(`/labels/${id}`, data);
    return response.data;
  },

  deleteLabel: async (id: number | string): Promise<void> => {
    await api.delete(`/labels/${id}`);
  },

  forceDeleteLabel: async (id: number | string): Promise<void> => {
    await api.delete(`/labels/${id}/force`);
  },

  addLabelToCard: async (cardId: number, labelId: number): Promise<any> => {
    const response = await api.post(`/cards/${cardId}/labels/${labelId}`);
    return response.data;
  },

  removeLabelFromCard: async (
    cardId: number,
    labelId: number
  ): Promise<any> => {
    const response = await api.delete(`/cards/${cardId}/labels/${labelId}`);
    return response.data;
  },
};
